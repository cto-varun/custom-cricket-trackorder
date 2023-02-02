"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _StatusFeedback = _interopRequireDefault(require("./StatusFeedback"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const MakingApiRequestView = /*#__PURE__*/_react.default.createElement("div", {
  className: "content"
}, /*#__PURE__*/_react.default.createElement("div", {
  className: "element"
}, /*#__PURE__*/_react.default.createElement(_antd.Spin, {
  size: "large"
})), /*#__PURE__*/_react.default.createElement("div", {
  className: "element text-center"
}, /*#__PURE__*/_react.default.createElement(_antd.Typography.Title, {
  level: 3
}, "Cancelling order...")));
function CancelOrder(_ref) {
  let {
    order,
    workflows,
    datasources
  } = _ref;
  const [isLoading, setIsLoading] = (0, _react.useState)(false);
  const [status, setStatus] = (0, _react.useState)();
  const [msg, setMsg] = (0, _react.useState)();
  (0, _react.useEffect)(() => {
    handleCancelOrder();
  }, []);
  const handleCancelOrder = () => {
    setIsLoading(true);
    const {
      workflow,
      datasource,
      successStates,
      errorStates,
      responseMapping
    } = workflows?.cancelOrder;
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleCancelOrderResponse(successStates, errorStates), {});
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat('SUBMIT'), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[datasource],
        request: {
          params: {
            uuid: order?.uuid
          }
        },
        responseMapping
      }
    });
  };
  const handleCancelOrderResponse = (successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        setStatus('success');
        setMsg('Successfully cancelled the order!');
      }
      if (isFailure) {
        setStatus('error');
        setMsg(eventData?.event?.data?.message || 'Error cancelling order!');
      }
      setIsLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "view-container d-flex justify-content-center align-items-center"
  }, isLoading ? MakingApiRequestView : /*#__PURE__*/_react.default.createElement(_StatusFeedback.default, {
    status: status,
    msg: msg
  }));
}
var _default = CancelOrder;
exports.default = _default;
module.exports = exports.default;