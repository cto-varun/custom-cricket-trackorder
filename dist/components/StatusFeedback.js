"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function StatusFeedback(_ref) {
  let {
    status,
    msg
  } = _ref;
  const titleMapping = {
    success: 'Success!',
    error: 'Error'
  };
  return /*#__PURE__*/_react.default.createElement(_antd.Result, {
    status: status,
    title: titleMapping[status],
    subTitle: msg
  });
}
var _default = StatusFeedback;
exports.default = _default;
module.exports = exports.default;