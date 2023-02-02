"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
var _moment = _interopRequireDefault(require("moment"));
var _icons = require("@ant-design/icons");
var _helpers = require("../helpers");
var _componentCache = require("@ivoyant/component-cache");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const {
  Text
} = _antd.Typography;
const OrderList = _ref => {
  let {
    data,
    isLoading,
    fetchDataWithParams,
    handleActionClick,
    error,
    parentProps = {},
    fetchLastSearchOrder
  } = _ref;
  const handleOrderIdClick = orderid => {
    fetchDataWithParams({
      orderid
    });
  };
  const columns = [{
    dataIndex: 'orderId',
    title: 'Order ID',
    align: 'left',
    sorter: (a, b) => +a.orderId - +b.orderId,
    render: (text, record, index) => {
      const disabled = record.orderStepStatus === 'CANCELLED' || record.orderStepStatus === 'FAILURE';
      const isOrderDetails = data?.length === 1;
      const legacyOrder = record?.isLegacyOrder;
      return legacyOrder ? /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
        title: "Unsupported Voyage Order. Must be managed in ASAP"
      }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
        type: "link",
        style: {
          fontWeight: '600'
        },
        disabled: true
      }, text)) : isOrderDetails ? /*#__PURE__*/_react.default.createElement(Text, {
        strong: true
      }, text) : /*#__PURE__*/_react.default.createElement(_antd.Button, {
        type: "link",
        style: {
          fontWeight: '600'
        },
        disabled: disabled,
        onClick: () => {
          handleOrderIdClick(text);
        }
      }, text);
    }
  }, {
    dataIndex: 'billingAccountNumber',
    title: 'Account Number',
    align: 'left',
    sorter: (a, b) => +a.billingAccountNumber - +b.billingAccountNumber
  }, {
    dataIndex: 'firstName',
    title: 'First Name',
    align: 'left',
    sorter: (a, b) => a.firstName.localeCompare(b.firstName, 'en', {
      sensitivity: 'base'
    })
  }, {
    dataIndex: 'lastName',
    title: 'Last Name',
    align: 'left',
    sorter: (a, b) => a.lastName.localeCompare(b.lastName, 'en', {
      sensitivity: 'base'
    })
  }, {
    dataIndex: 'orderStep',
    title: 'Step',
    align: 'left',
    sorter: (a, b) => a.lastName.localeCompare(b.orderStep, 'en', {
      sensitivity: 'base'
    })
  }, {
    dataIndex: 'orderStepStatus',
    title: 'Status',
    align: 'left',
    // filters: orderFilters,
    sorter: (a, b) => a.orderStepStatus.localeCompare(b.orderStepStatus, 'en', {
      sensitivity: 'base'
    }),
    render: (text, record) => {
      const isOrderDetails = data?.length === 1;
      const isPaymentDue = record.orderStepStatus === 'OKTOSUBMIT' && (record.orderDueAmount !== undefined && record?.accountBalance !== undefined && record.orderDueAmount + record?.accountBalance > 0 ? true : false);
      const title = isPaymentDue ? 'PAYMENTPENDING' : text;
      const legacyOrder = record?.isLegacyOrder;
      const content = isOrderDetails ? /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, "Line of business: ", record.lineOfBusiness), isPaymentDue ? (record.orderDueAmount || typeof record.orderDueAmount !== 'undefined') && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, "Order step : Make Payment"), /*#__PURE__*/_react.default.createElement("p", null, "Order due amount : $", Number(record.orderDueAmount).toFixed(2), "."), /*#__PURE__*/_react.default.createElement("p", null, "Go to make a payment and complete the payment for the Order Due Amount."), /*#__PURE__*/_react.default.createElement("p", null, "Note : The Account you are logged in could be different from the Order Account")) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, record.orderStep && /*#__PURE__*/_react.default.createElement("p", null, "Order step : ", record.orderStep), record.orderStepStatus && /*#__PURE__*/_react.default.createElement("p", null, "Order step status :", ' ', record.orderStepStatus)), record?.internalOrderTrackingStatusInfo?.message && record.orderStep !== 'CANCEL' && /*#__PURE__*/_react.default.createElement("p", null, "Message:", ' ', record?.internalOrderTrackingStatusInfo?.message)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
      return isOrderDetails ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Tag, {
        color: _helpers.Tags[title].color
      }, _helpers.Tags[title].title), /*#__PURE__*/_react.default.createElement(_antd.Popover, {
        content: content
      }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
        type: "link",
        shape: "circle",
        icon: /*#__PURE__*/_react.default.createElement(_icons.InfoCircleOutlined, null)
      }))) : /*#__PURE__*/_react.default.createElement(_antd.Tag, {
        color: legacyOrder ? 'default' : _helpers.Tags[title].color
      }, _helpers.Tags[title].title);
    }
  }, {
    dataIndex: 'orderDate',
    title: 'Date',
    sorter: (a, b) => {
      const aDate = new Date(a.orderDate);
      const bDate = new Date(b.orderDate);
      // eslint-disable-next-line no-nested-ternary
      return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
    },
    render: text => (0, _moment.default)(text).format('YYYY-MM-DD')
  }, {
    render: (_, record) => {
      const enableUpdate = !record?.internalOrderTrackingStatusInfo?.blockOrderIndicator && record?.internalOrderTrackingStatusInfo?.allowUpdateOrder;
      const cancelDisabled = !record?.internalOrderTrackingStatusInfo?.allowCancelOrder;
      const disableSubmit = cancelDisabled || record?.internalOrderTrackingStatusInfo?.blockOrderIndicator || record.orderDueAmount !== undefined && record?.accountBalance !== undefined && record.orderDueAmount + record?.accountBalance > 0 ? true : false;
      return /*#__PURE__*/_react.default.createElement(_antd.Space, {
        size: "middle"
      }, record.orderStepStatus !== 'OKTOSUBMIT' || enableUpdate ? /*#__PURE__*/_react.default.createElement(_antd.Button, {
        type: "link",
        shape: "circle",
        disabled: !enableUpdate,
        onClick: () => handleActionClick(_helpers.Actions.UPDATE, record),
        icon: /*#__PURE__*/_react.default.createElement(_icons.EditOutlined, null)
      }) : /*#__PURE__*/_react.default.createElement(_antd.Button, {
        type: "link",
        shape: "circle",
        disabled: disableSubmit,
        onClick: () => handleActionClick(_helpers.Actions.SUBMIT, record),
        icon: /*#__PURE__*/_react.default.createElement(_icons.CheckCircleOutlined, null)
      }), /*#__PURE__*/_react.default.createElement(_antd.Button, {
        type: "link",
        shape: "circle",
        disabled: cancelDisabled,
        onClick: () => handleActionClick(_helpers.Actions.CANCEL, record),
        icon: /*#__PURE__*/_react.default.createElement(_icons.StopOutlined, null)
      }), /*#__PURE__*/_react.default.createElement(_antd.Button, {
        type: "link",
        shape: "circle",
        onClick: () =>
        // handleActionClick(Actions.CANCEL, record)
        fetchLastSearchOrder(),
        icon: /*#__PURE__*/_react.default.createElement(_icons.ReloadOutlined, null)
      }));
    }
  }];
  let finalColumns = columns.filter((_, index, colArray) => {
    const includeActionBtns = data.length === 1;
    return includeActionBtns || index !== colArray.length - 1;
  });

  // the filter to show or hide columns in track order table, based on the number of orders we are getting from API.
  // If only one row is coming then show the order step and order step status column, else we hide them.

  if (data?.length !== 1) {
    finalColumns = finalColumns.filter(col => col.dataIndex !== 'orderStep' && col.dataIndex !== 'orderStepStatus');
  }
  const checkLineForEdit = (lines, customerTelephoneNumber) => {
    const currentLine = lines?.find(l => l?.customerTelephoneNumber === customerTelephoneNumber);
    return currentLine?.lineActions?.updatePortDetails ? true : false;
  };
  const expandedRowRender = () => {
    const columns = [{
      title: 'Phone Number',
      dataIndex: 'customerTelephoneNumber',
      key: 'customerTelephoneNumber'
    }, {
      title: 'Line Step',
      dataIndex: 'lineStep',
      key: 'lineStep'
    }, {
      title: 'Line Step Status',
      dataIndex: 'lineStepStatus',
      key: 'lineStepStatus',
      render: (text, record) => {
        return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, text);
      }
    }, {
      title: 'Line Step Details',
      dataIndex: 'lineStepDetails',
      key: 'lineStepDetails',
      render: data => {
        return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, " ", data?.length > 0 && data[0]?.message);
      }
    }, {
      title: 'Port In Status Text',
      dataIndex: 'portInDetails',
      key: 'portInDetails',
      render: data => {
        return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
          placement: "topRight",
          title: data?.portInRequestStatus?.portInStatusDescription
        }, data?.portInRequestStatus?.portInRequestStatusText));
      }
    }, {
      title: 'Due Date/Time',
      dataIndex: 'portInDetails',
      key: 'portInDetails date',
      ellipsis: {
        showTitle: false
      },
      render: data => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, data?.portInRequestStatus?.portInEstimatedDueDate ? _moment.default.tz((0, _moment.default)(data?.portInRequestStatus?.portInEstimatedDueDate).format(), 'America/New_York').format('DD MMM YYYY  / HH:mm a') : 'N/A')
    }, {
      render: (dt, record) => {
        const enableUpdate = checkLineForEdit(data[0]?.internalOrderTrackingStatusInfo?.lines, record?.customerTelephoneNumber);
        return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
          type: "link",
          shape: "circle",
          disabled: !enableUpdate,
          onClick: () => {
            _componentCache.cache.put('portEdit', true);
            handleActionClick(_helpers.Actions.UPDATE, {
              ...record,
              billingAccountNumber: data[0]?.billingAccountNumber,
              firstName: data[0]?.firstName,
              lastName: data[0]?.lastName,
              orderStepStatus: data[0]?.orderStepStatus,
              orderTrackingStatusInfo: data[0]?.orderTrackingStatusInfo,
              orderDate: data[0]?.orderDate,
              lines: data[0]?.lines,
              internalOrderTrackingStatusInfo: data[0]?.internalOrderTrackingStatusInfo,
              uuid: data[0]?.uuid
            });
          },
          icon: /*#__PURE__*/_react.default.createElement(_icons.EditOutlined, null)
        }));
      }
    }];
    return /*#__PURE__*/_react.default.createElement(_antd.Table, {
      columns: columns,
      dataSource: data[0].lines,
      pagination: false
    });
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "order-list"
  }, /*#__PURE__*/_react.default.createElement(_antd.Table, {
    className: "order-list-table",
    loading: isLoading,
    pagination: {
      pageSize: 9
    },
    columns: finalColumns,
    dataSource: data,
    expandable: {
      defaultExpandAllRows: true,
      expandedRowRender: data?.length === 1 ? expandedRowRender : false
    },
    locale: {
      emptyText: error
    }
  }));
};
var _default = OrderList;
exports.default = _default;
module.exports = exports.default;