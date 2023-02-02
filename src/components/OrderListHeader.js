import React, { useState } from 'react';
import { Select, DatePicker, Tag, Button } from 'antd';
import moment from 'moment';
import { SearchOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Tags } from '../helpers';
import { cache } from '@ivoyant/component-cache';

const typeOptions = [
    { value: 'billingAccountNumber', label: 'Billing Account Number' },
    { value: 'orderid', label: 'Order ID' },
    { value: 'ctn', label: 'Phone Number' },
    { value: 'orderStepStatus', label: 'Status' },
];
const statusOptions = Object.keys(Tags).map((item) => ({
    value: item,
    label: Tags[item].title,
}));

const FilterTag = (props) => {
    const { label, closable, onClose } = props;

    return (
        <Tag closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
            {label}
        </Tag>
    );
};

const OrderListHeader = ({
    fetchDataWithParams,
    isLoading,
    setActivateBackButton,
}) => {
    const [selectData, setSelectData] = useState([]);
    const [dates, setDates] = useState([]);
    const [options, setOptions] = useState(typeOptions);
    const [mode, setMode] = useState('multiple');

    const handleChangeFilter = (res) => {
        if (res.length > selectData.length) {
            if (selectData.length && !selectData[selectData.length - 1].value) {
                const lastFilter = selectData[selectData.length - 1];
                if (lastFilter.type === 'orderStepStatus') {
                    lastFilter.value = options.find(
                        (opt) => opt.value === res[res.length - 1]
                    );
                } else {
                    const updatedData = selectData.map((item, i, arr) => {
                        if (i === arr.length - 1) {
                            return { ...item, value: res[res.length - 1] };
                        }
                        return item;
                    });
                    setSelectData(updatedData);
                }
                setOptions(
                    typeOptions.filter(
                        (type) =>
                            !selectData.find(
                                (opt) => opt.type.label === type.label
                            )
                    )
                );
                setMode('tags');
            } else {
                const optionData = options.find(
                    (opt) => opt.value === res[res.length - 1]
                );
                if (optionData) {
                    setSelectData([
                        ...selectData,
                        {
                            type: optionData,
                        },
                    ]);
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

    const handleRemoveFilter = (label) => {
        const [typeLabel] = label.split(' = ');
        const result = selectData.filter(
            (item) => item.type.label !== typeLabel
        );
        setSelectData(result);
        if (mode === 'multiple') {
            const dropdown = typeOptions.filter(
                (typeOption) =>
                    !result.find((item) => item.type.value === typeOption.value)
            );
            setOptions(dropdown);
        }
        if (mode === 'tags') {
            setOptions(
                typeOptions.filter(
                    (typeOption) =>
                        !result.find((opt) => {
                            return opt.type.label === typeOption.label;
                        })
                )
            );
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
                if (
                    k === 'ctn' ||
                    k === 'billingAccountNumber' ||
                    k === 'orderid'
                ) {
                    return { ...obj, [k]: +item.value };
                }
                if (k === 'orderStepStatus') {
                    const byDate = {};
                    byDate[k] = item.value;
                    return { ...obj, byDate };
                }
            }, {});
        }
        const [fromDate, toDate] = dates;
        if (fromDate && toDate) {
            paramObj = {
                ...paramObj,
                byDate: { ...(paramObj?.byDate || {}), fromDate, toDate },
            };
        }
        cache.put('lastOrderSearchParams', JSON.stringify(paramObj));
        setActivateBackButton(true);
        fetchDataWithParams(paramObj);
    };

    return (
        <div className="order-list-header">
            <div className="title">Orders</div>
            <div className="search-box">
                <Select
                    mode="tags"
                    // choiceTransitionName="none"
                    className="search-box-select"
                    dropdownMatchSelectWidth={50}
                    allowClear
                    placeholder="Type search parameter (Order Id, Account Number, Status etc.) to add a filter..."
                    value={selectData.map(
                        (opt) => `${opt.type?.label} = ${opt.value || ''}`
                    )}
                    onChange={handleChangeFilter}
                    style={{ width: '100%' }}
                    options={options}
                    tagRender={(props) => (
                        <FilterTag
                            {...props}
                            onClose={(e) => {
                                handleRemoveFilter(props.label);
                                props.onClose(e);
                            }}
                        />
                    )}
                />

                <DatePicker.RangePicker
                    onChange={handleDateChange}
                    disabledDate={(d) =>
                        !d ||
                        d.isAfter(moment()) ||
                        d.isBefore(moment().subtract(15, 'd'))
                    }
                    presets={{
                        Today: [moment(), moment()],
                        Yesterday: [
                            moment().subtract(1, 'd'),
                            moment().subtract(1, 'd'),
                        ],
                        'This Week': [moment().startOf('week'), moment()],
                        // 'This Month': [
                        //     moment().startOf('month'),
                        //     moment().endOf('month'),
                        // ],
                    }}
                />
                <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    loading={isLoading}
                    onClick={handleSearchClick}
                >
                    Search
                </Button>
            </div>
            <div className="help">
                <Button
                    type="link"
                    shape="circle"
                    onClick={() => {}}
                    icon={<QuestionCircleOutlined style={{ fontSize: 20 }} />}
                />
            </div>
        </div>
    );
};

export default OrderListHeader;
