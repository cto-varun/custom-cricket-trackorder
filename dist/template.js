"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = OrderListWrapper;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _OrderListHeader = _interopRequireDefault(require("./components/OrderListHeader"));
var _OrderList = _interopRequireDefault(require("./components/OrderList"));
var _UpdateOrder = _interopRequireDefault(require("./components/UpdateOrder"));
var _Auth = _interopRequireDefault(require("./components/Auth"));
var _CancelOrder = _interopRequireDefault(require("./components/CancelOrder"));
var _SubmitOrder = _interopRequireDefault(require("./components/SubmitOrder"));
var _Stepper = _interopRequireDefault(require("./components/Stepper"));
var _helpers = require("./helpers");
var _jsPlugin = _interopRequireDefault(require("js-plugin"));
var _componentCache = require("@ivoyant/component-cache");
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const InitialView = /*#__PURE__*/_react.default.createElement("div", {
  className: "view-container d-flex justify-content-center align-items-center"
}, /*#__PURE__*/_react.default.createElement("div", {
  className: "content"
}, /*#__PURE__*/_react.default.createElement("div", {
  className: "element"
}, /*#__PURE__*/_react.default.createElement("div", {
  className: "icon-container"
}, /*#__PURE__*/_react.default.createElement(_icons.SearchOutlined, {
  style: {
    fontSize: '34px',
    color: 'white'
  }
}))), /*#__PURE__*/_react.default.createElement("div", {
  className: "element text-center"
}, /*#__PURE__*/_react.default.createElement(_antd.Typography.Title, {
  level: 3
}, "Find orders by typing a search parameter ", /*#__PURE__*/_react.default.createElement("br", null), " or selecting a date range"))));
const ActionFlow = _ref => {
  let {
    order,
    action,
    workflows,
    datasources,
    fetchLastSearchOrder
  } = _ref;
  if (action === _helpers.Actions.UPDATE) {
    return /*#__PURE__*/_react.default.createElement(_UpdateOrder.default, {
      order: order,
      workflows: workflows,
      datasources: datasources,
      fetchLastSearchOrder: fetchLastSearchOrder
    });
  }
  if (action === _helpers.Actions.CANCEL) {
    return /*#__PURE__*/_react.default.createElement(_CancelOrder.default, {
      order: order,
      workflows: workflows,
      datasources: datasources
    });
  }
  if (action === _helpers.Actions.SUBMIT) {
    return /*#__PURE__*/_react.default.createElement(_SubmitOrder.default, {
      order: order
    });
  }
};
const flattenData = arr => {
  return arr.map(order => {
    const {
      orderAccountInfo,
      ...rest
    } = order;
    return {
      ...rest,
      ...orderAccountInfo,
      key: rest.orderId
    };
  });
};
function OrderListWrapper(_ref2) {
  let {
    datasources,
    properties
  } = _ref2;
  const {
    backButtonString = 'Search Order Res'
  } = properties;
  const [finalData, setFinalData] = (0, _react.useState)();
  const [isLoading, setIsLoading] = (0, _react.useState)(false);
  const [order, setOrder] = (0, _react.useState)();
  const [action, setAction] = (0, _react.useState)();
  const [needsAuth, setNeedsAuth] = (0, _react.useState)(true);
  const [securityQuestionData, setSecurityQuestionData] = (0, _react.useState)();
  const [error, setError] = (0, _react.useState)();
  const [activateBackButton, setActivateBackButton] = (0, _react.useState)(false);
  const collectSecurityQuestionResponse = response => {
    if (response && response.payload) {
      setSecurityQuestionData(response.payload);
    }
    window[window.sessionStorage?.tabId]['sendorders-auth-async-machine']('RESET');
  };
  (0, _react.useEffect)(() => {
    window[window.sessionStorage?.tabId].authSecurityQuestionResponse = value => collectSecurityQuestionResponse(value);
    return () => {
      delete window[window.sessionStorage?.tabId].authSecurityQuestionResponse;
    };
  });
  const fetchDataWithParams = params => {
    setIsLoading(true);
    window[window.sessionStorage?.tabId]['sendsearch-order-async-machine']('SET.REQUEST.DATA', {
      value: params
    });
    window[window.sessionStorage?.tabId]['sendsearch-order-async-machine']('REFETCH');
  };
  const collectSearchOrderResponse = response => {
    if (response && response.payload) {
      const {
        responseStatus,
        orders
      } = response.payload;
      if (responseStatus < 300) {
        setFinalData(flattenData(orders));
      } else {
        setFinalData([]);
        setError(response?.payload?.causedBy?.length > 0 ? response?.payload?.causedBy[0]?.message : 'Error searching the orders!');
      }
    } else {
      setError('Internal Server Error!');
      setFinalData([]);
    }
    if (window[window.sessionStorage?.tabId]['sendsearch-order-async-machine']) {
      window[window.sessionStorage?.tabId]['sendsearch-order-async-machine']('RESET');
    }
    setIsLoading(false);
  };
  (0, _react.useEffect)(() => {
    window[window.sessionStorage?.tabId].orderListSearchOrdersResponse = value => collectSearchOrderResponse(value);
    return () => {
      delete window[window.sessionStorage?.tabId].orderListSearchOrdersResponse;
    };
  });
  const handleActionClick = (actionType, record) => {
    setAction(actionType);
    setOrder({
      ...record,
      ...record?.portInDetails
    });
    if (record.billingAccountNumber === window[window.sessionStorage?.tabId].alasql.tables.datasource_360_customer_view.data[0].account.billingAccountNumber) {
      setNeedsAuth(false);
    }
    if (needsAuth) {
      window[window.sessionStorage?.tabId]['sendorders-auth-async-machine']('APPEND.URL', {
        value: `/${record.billingAccountNumber}`
      });
      window[window.sessionStorage?.tabId]['sendorders-auth-async-machine']('FETCH');
    }
  };
  const getFeatureData = featureKey => {
    const featureFlag = _jsPlugin.default.invoke('features.evaluate', featureKey);
    return featureFlag && featureFlag[0];
  };
  const fetchLastSearchOrder = () => {
    setActivateBackButton(false);
    let lastOrderSearchParams = _componentCache.cache.get('lastOrderSearchParams');
    if (lastOrderSearchParams) {
      fetchDataWithParams(JSON.parse(lastOrderSearchParams));
    }
  };
  const activityFeatureFlag = getFeatureData('activityManagement');
  return activityFeatureFlag && !activityFeatureFlag.enabled ? /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    className: "payments-alert",
    message: `Track order is disabled ${activityFeatureFlag?.reasons?.length > 0 ? `due to ${activityFeatureFlag?.reasons.toString()}` : ''}`,
    type: "info",
    showIcon: true
  }) : /*#__PURE__*/_react.default.createElement("div", {
    className: "order-list-background"
  }, activateBackButton && /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "cta-back-button"
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    style: {
      display: 'flex',
      cursor: 'pointer',
      gap: '4px'
    },
    onClick: () => fetchLastSearchOrder()
  }, /*#__PURE__*/_react.default.createElement(_icons.ArrowLeftOutlined, {
    style: {
      margin: 'auto 0'
    }
  }), backButtonString)), /*#__PURE__*/_react.default.createElement("div", {
    className: "order-list-wrapper"
  }, !order ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_OrderListHeader.default, {
    isLoading: isLoading,
    fetchDataWithParams: fetchDataWithParams,
    setActivateBackButton: setActivateBackButton
  }), !finalData ? InitialView : /*#__PURE__*/_react.default.createElement(_OrderList.default, {
    data: finalData,
    isLoading: isLoading,
    fetchDataWithParams: fetchDataWithParams,
    handleActionClick: handleActionClick,
    error: error,
    fetchLastSearchOrder: fetchLastSearchOrder
  })) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_Stepper.default, {
    action: action,
    needsAuth: needsAuth,
    onClose: () => {
      _componentCache.cache.remove('portEdit');
      setOrder(undefined);
      setNeedsAuth(true);
      setSecurityQuestionData({});
    }
  }), needsAuth ? /*#__PURE__*/_react.default.createElement(_Auth.default, {
    workflows: properties?.workflows,
    datasources: datasources,
    securityQuestionData: securityQuestionData,
    ban: order?.billingAccountNumber,
    onSuccess: () => {
      setNeedsAuth(false);
    }
  }) : /*#__PURE__*/_react.default.createElement(ActionFlow, {
    order: order,
    action: action,
    workflows: properties?.workflows,
    datasources: datasources,
    fetchLastSearchOrder: fetchLastSearchOrder
  }))));
}
module.exports = exports.default;