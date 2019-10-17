import React from 'react';


function LabelValue(props) {


    return (
        <div className={props.label} >
            <div style={{
                fontSize: 22, textAlign: 'left', backgroundColor: '#AAAAAA', color: 'white', display: 'inline-block', padding: '5px'
            }}>
                {props.label}
            </div>
            {props.value ? <div style={{
                backgroundColor: '#EEEEEE', fontSize: 18, textAlign: 'left', display: 'inline-block', padding: '9px 8px 6px 8px', display: 'inline-block', height: '100%'
            }}>
                {props.value}
            </div> : null}

        </div>
    )
}

export default LabelValue;