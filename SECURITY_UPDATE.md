# 安全更新日志

## 2024-02-15 - Multer 安全更新

### 修复的漏洞

修复了 multer 依赖中的多个拒绝服务 (DoS) 漏洞：

1. **CVE: 恶意请求导致的未处理异常 DoS**
   - 影响版本: >= 1.4.4-lts.1, < 2.0.2
   - 修复版本: 2.0.2

2. **CVE: 未处理异常导致的 DoS**
   - 影响版本: >= 1.4.4-lts.1, < 2.0.1
   - 修复版本: 2.0.1

3. **CVE: 恶意请求导致的 DoS**
   - 影响版本: >= 1.4.4-lts.1, < 2.0.0
   - 修复版本: 2.0.0

4. **CVE: 未关闭流导致的内存泄漏 DoS**
   - 影响版本: < 2.0.0
   - 修复版本: 2.0.0

### 更新内容

- 将 `multer` 从 `^1.4.5-lts.1` 升级到 `^2.0.2`
- 所有 DoS 漏洞已修复
- API 兼容，无需代码修改

### 影响范围

- 文件上传功能
- 菜品图片上传
- 评价图片上传

### 测试建议

更新后建议测试：
1. 单张图片上传
2. 多张图片上传
3. 错误文件类型上传（应被拒绝）
4. 超大文件上传（应被拒绝）

### 升级步骤

```bash
cd backend
npm install
# 或者
npm update multer
```

### 参考链接

- [Multer GitHub](https://github.com/expressjs/multer)
- [Multer 2.0.0 Release Notes](https://github.com/expressjs/multer/releases/tag/v2.0.0)
