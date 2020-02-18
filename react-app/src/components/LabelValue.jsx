import React from 'react';

// Value and corresponding Label
function LabelValue(props) {


    return (
        <div  >
            {/* Label */}
            {props.label ?
                <div className={props.className + ' normal'} >
                    {props.label}
                </div> : null}

            {/* Value */}
            {props.value ? <div style={{
                backgroundColor: '#EEEEEE', fontSize: 18,
                textAlign: 'left', display: 'inline-block',
                padding: '9px 8px 6px 8px', height: '100%', color: props.color || "black"
            }}>
                {props.value}
            </div> : null}

        </div>
    )
}

export default LabelValue;
