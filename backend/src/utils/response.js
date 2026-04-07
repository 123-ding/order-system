/**
 * 统一响应工具
 */

class ResponseHelper {
  /**
   * 成功响应
   */
  static success(res, data = null, message = 'success', statusCode = 200) {
    return res.status(statusCode).json({
      code: 0,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 分页响应
   */
  static paginate(res, list, pagination, message = 'success') {
    return res.status(200).json({
      code: 0,
      message,
      data: {
        list,
        pagination: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          totalPages: Math.ceil(pagination.total / pagination.pageSize),
        },
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 错误响应
   */
  static error(res, code, message, statusCode = 400, errors = null) {
    const response = {
      code,
      message,
      timestamp: new Date().toISOString(),
    };
    if (errors) {
      response.errors = errors;
    }
    return res.status(statusCode).json(response);
  }

  /**
   * 参数错误
   */
  static badRequest(res, message = '参数错误', errors = null) {
    return this.error(res, 40000, message, 400, errors);
  }

  /**
   * 未认证
   */
  static unauthorized(res, message = '请先登录') {
    return this.error(res, 40100, message, 401);
  }

  /**
   * 无权限
   */
  static forbidden(res, message = '无权限访问') {
    return this.error(res, 40300, message, 403);
  }

  /**
   * 未找到
   */
  static notFound(res, message = '资源不存在') {
    return this.error(res, 40400, message, 404);
  }

  /**
   * 业务冲突
   */
  static conflict(res, message = '操作冲突') {
    return this.error(res, 40900, message, 409);
  }

  /**
   * 服务器错误
   */
  static serverError(res, message = '服务器内部错误') {
    return this.error(res, 50000, message, 500);
  }
}

module.exports = ResponseHelper;
