/**
 * 文件上传控制器
 */
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的文件'
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        url: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的文件'
      });
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        urls: imageUrls
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
