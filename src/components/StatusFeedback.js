import React from 'react';
import { Result } from 'antd';

function StatusFeedback({ status, msg }) {
    const titleMapping = {
        success: 'Success!',
        error: 'Error',
    };
    return (
        <Result status={status} title={titleMapping[status]} subTitle={msg} />
    );
}

export default StatusFeedback;
