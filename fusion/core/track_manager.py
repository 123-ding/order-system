"""
航迹管理器

负责航迹的完整生命周期管理：
  起始（暂定）→ 确认 → 稳定跟踪 → 滑行 → 删除
"""

from __future__ import annotations

import time

import numpy as np

from ..config.settings import FusionConfig
from .models import Measurement, Track, TrackState


class TrackManager:
    """
    航迹管理器

    管理系统中所有航迹的创建、确认、删除等生命周期。

    Attributes:
        tracks: 当前活跃航迹列表
        config: 融合系统配置
    """

    def __init__(self, config: FusionConfig):
        self.config = config
        self.tracks: list[Track] = []
        self._deleted_tracks: list[Track] = []

    @property
    def active_tracks(self) -> list[Track]:
        """获取所有活跃航迹（非已删除）"""
        return [t for t in self.tracks if t.state != TrackState.DELETED]

    @property
    def confirmed_tracks(self) -> list[Track]:
        """获取已确认和稳定跟踪的航迹"""
        return [
            t for t in self.tracks
            if t.state in (TrackState.CONFIRMED, TrackState.TRACKING, TrackState.COASTING)
        ]

    def initiate_track(self, measurement: Measurement, current_time: float) -> Track:
        """
        用未关联量测初始化新航迹

        Args:
            measurement: 未关联的量测
            current_time: 当前时间

        Returns:
            Track: 新创建的暂定航迹
        """
        if len(self.active_tracks) >= self.config.max_tracks:
            return None  # 达到最大航迹数限制

        track = Track(
            state=TrackState.TENTATIVE,
            creation_time=current_time,
            last_update_time=current_time,
            hit_count=1,
            total_updates=1,
        )

        # 初始化状态向量
        if measurement.position is not None:
            track.state_vector[:3] = measurement.position

        # 初始化协方差
        pos_std = self.config.initial_position_std
        vel_std = self.config.initial_velocity_std
        track.covariance = np.diag([
            pos_std ** 2, pos_std ** 2, pos_std ** 2,
            vel_std ** 2, vel_std ** 2, vel_std ** 2,
        ])

        # 如果量测有速度信息
        if measurement.velocity is not None:
            track.state_vector[3:6] = measurement.velocity
            track.covariance[3, 3] = (vel_std / 2) ** 2
            track.covariance[4, 4] = (vel_std / 2) ** 2
            track.covariance[5, 5] = (vel_std / 2) ** 2

        track.associated_sensors.add(measurement.sensor_id)
        track.record_history()

        self.tracks.append(track)
        return track

    def update_track_state(self, track: Track, associated: bool, current_time: float):
        """
        更新航迹管理状态

        Args:
            track: 航迹对象
            associated: 本周期是否关联到量测
            current_time: 当前时间
        """
        track.total_updates += 1

        if associated:
            track.hit_count += 1
            track.miss_count = 0
            track.last_update_time = current_time
            track.record_history()

            if track.state == TrackState.TENTATIVE:
                if track.hit_count >= self.config.confirm_hits:
                    track.state = TrackState.CONFIRMED
            elif track.state == TrackState.CONFIRMED:
                track.state = TrackState.TRACKING
            elif track.state == TrackState.COASTING:
                track.state = TrackState.TRACKING
        else:
            track.miss_count += 1

            if track.state == TrackState.TRACKING:
                if track.miss_count >= 2:
                    track.state = TrackState.COASTING
            elif track.state == TrackState.COASTING:
                if track.miss_count >= self.config.max_coast_cycles:
                    track.state = TrackState.DELETED
            elif track.state == TrackState.TENTATIVE:
                if track.miss_count >= self.config.tentative_max_miss:
                    track.state = TrackState.DELETED

        # 更新质量评分
        track.compute_quality()

    def cleanup_deleted(self):
        """清理已删除的航迹"""
        deleted = [t for t in self.tracks if t.state == TrackState.DELETED]
        self._deleted_tracks.extend(deleted)
        self.tracks = [t for t in self.tracks if t.state != TrackState.DELETED]

    def get_track_summary(self) -> dict:
        """获取航迹管理状态摘要"""
        states = {}
        for t in self.tracks:
            name = t.state.name
            states[name] = states.get(name, 0) + 1

        return {
            "total_active": len(self.active_tracks),
            "total_confirmed": len(self.confirmed_tracks),
            "total_deleted": len(self._deleted_tracks),
            "by_state": states,
        }
