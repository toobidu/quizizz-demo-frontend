import React from 'react';

const HostInfo = ({host}) => {
    if (!host) return null;

    return (<div className="host-info">
        <h4>👑 Host: {host.username}</h4>
    </div>);
};

export default HostInfo;
