"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _moment = _interopRequireDefault(require("moment"));
var _icons = require("@ant-design/icons");
var _helpers = require("../helpers");
var _componentCache = require("@ivoyant/component-cache");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const typeOptions = [{
  value: 'billingAccountNumber',
  label: 'Billing Account Number'
}, {
  value: 'orderid',
  label: 'Order ID'
}, {
  value: 'ctn',
  label: 'Phone Number'
}, {
  value: 'orderStepStatus',
  label: 'Status'
}];
const statusOptions = Object.keys(_helpers.Tags).map(item => ({
  value: item,
  label: _helpers.Tags[item].title
}));
const FilterTag = props => {
  const {
    label,
    closable,
    onClose
  } = props;
  return /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    closable: closable,
    onClose: onClose,
    style: {
      marginRight: 3
    }
  }, label);
};
const OrderListHeader = _ref => {
  let {
    fetchDataWithParams,
    isLoading,
    setActivateBackButton
  } = _ref;
  const [selectData, setSelectData] = (0, _react.useState)([]);
  const [dates, setDates] = (0, _react.useState)([]);
  const [options, setOptions] = (0, _react.useState)(typeOptions);
  const [mode, setMode] = (0, _react.useState)('multiple');
  const handleChangeFilter = res => {
    if (res.length > selectData.length) {
      if (selectData.length && !selectData[selectData.length - 1].value) {
        const lastFilter = selectData[selectData.length - 1];
        if (lastFilter.type === 'orderStepStatus') {
          lastFilter.value = options.find(opt => opt.value === res[res.length - 1]);
        } else {
          const updatedData = selectData.map((item, i, arr) => {
            if (i === arr.length - 1) {
              return {
                ...item,
                value: res[res.length - 1]
              };
            }
            return item;
          });
          setSelectData(updatedData);
        }
        setOptions(typeOptions.filter(type => !selectData.find(opt => opt.type.label === type.label)));
        setMode('tags');
      } else {
        const optionData = options.find(opt => opt.value === res[res.length - 1]);
        if (optionData) {
          setSelectData([...selectData, {
            type: optionData
          }]);
        }
        if (res[res.length - 1] === 'orderStepStatus') {
          setOptions(statusOptions);
          setMode('multiple');
        } else {
          if (optionData) {
            setOptions([]);
          } else {
            setOptions(typeOptions);
          }
          setMode('tags');
        }
      }
    }
  };
  const handleRemoveFilter = label => {
    const [typeLabel] = label.split(' = ');
    const result = selectData.filter(item => item.type.label !== typeLabel);
    setSelectData(result);
    if (mode === 'multiple') {
      const dropdown = typeOptions.filter(typeOption => !result.find(item => item.type.value === typeOption.value));
      setOptions(dropdown);
    }
    if (mode === 'tags') {
      setOptions(typeOptions.filter(typeOption => !result.find(opt => {
        return opt.type.label === typeOption.label;
      })));
    }
  };
  const handleDateChange = (_, dateStrings) => {
    setDates(dateStrings);
  };
  const handleSearchClick = () => {
    let paramObj = {};
    if (selectData.length > 0) {
      paramObj = selectData.reduce((obj, item) => {
        const k = item.type.value;
        if (k === 'ctn' || k === 'billingAccountNumber' || k === 'orderid') {
          return {
            ...obj,
            [k]: +item.value
          };
        }
        if (k === 'orderStepStatus') {
          const byDate = {};
          byDate[k] = item.value;
          return {
            ...obj,
            byDate
          };
        }
      }, {});
    }
    const [fromDate, toDate] = dates;
    if (fromDate && toDate) {
      paramObj = {
        ...paramObj,
        byDate: {
          ...(paramObj?.byDate || {}),
          fromDate,
          toDate
        }
      };
    }
    _componentCache.cache.put('lastOrderSearchParams', JSON.stringify(paramObj));
    setActivateBackButton(true);
    fetchDataWithParams(paramObj);
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "order-list-header"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "title"
  }, "Orders"), /*#__PURE__*/_react.default.createElement("div", {
    className: "search-box"
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    mode: "tags"
    // choiceTransitionName="none"
    ,
    className: "search-box-select",
    dropdownMatchSelectWidth: 50,
    allowClear: true,
    placeholder: "Type search parameter (Order Id, Account Number, Status etc.) to add a filter...",
    value: selectData.map(opt => `${opt.type?.label} = ${opt.value || ''}`),
    onChange: handleChangeFilter,
    style: {
      width: '100%'
    },
    options: options,
    tagRender: props => /*#__PURE__*/_react.default.createElement(FilterTag, _extends({}, props, {
      onClose: e => {
        handleRemoveFilter(props.label);
        props.onClose(e);
      }
    }))
  }), /*#__PURE__*/_react.default.createElement(_antd.DatePicker.RangePicker, {
    onChange: handleDateChange,
    disabledDate: d => !d || d.isAfter((0, _moment.default)()) || d.isBefore((0, _moment.default)().subtract(15, 'd')),
    presets: {
      Today: [(0, _moment.default)(), (0, _moment.default)()],
      Yesterday: [(0, _moment.default)().subtract(1, 'd'), (0, _moment.default)().subtract(1, 'd')],
      'This Week': [(0, _moment.default)().startOf('week'), (0, _moment.default)()]
      // 'This Month': [
      //     moment().startOf('month'),
      //     moment().endOf('month'),
      // ],
    }
  }), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "primary",
    icon: /*#__PURE__*/_react.default.createElement(_icons.SearchOutlined, null),
    loading: isLoading,
    onClick: handleSearchClick
  }, "Search")), /*#__PURE__*/_react.default.createElement("div", {
    className: "help"
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "link",
    shape: "circle",
    onClick: () => {},
    icon: /*#__PURE__*/_react.default.createElement(_icons.QuestionCircleOutlined, {
      style: {
        fontSize: 20
      }
    })
  })));
};
var _default = OrderListHeader;
exports.default = _default;
module.exports = exports.default;