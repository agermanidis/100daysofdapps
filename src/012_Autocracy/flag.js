import React, { Component } from 'react';
import randomColor from 'randomcolor';
import _ from 'underscore';

// Based on Lars Ruoff's generator, released under CC0: http://flag-designer.appspot.com/

const randomDivision = () => {
    const color1 = randomColor();
    const color2 = randomColor();
    const color3 = randomColor();
    const divisions = {
        none: [],
        twoHorizontal: [
            <rect width="360" height="120" x="0" y="0" fill={color1} />,
            <rect width="360" height="120" x="0" y="120" fill={color2} />
        ],
        twoVertical: [
            <rect width="180" height="240" x="0" y="0" fill={color1} />,
            <rect width="180" height="240" x="180" y="0" fill={color2} />
        ],
        threeHorizontal: [
            <rect width="360" height="80" x="0" y="0" fill={color1} />,
            <rect width="360" height="80" x="0" y="80" fill={color2} />,
            <rect width="360" height="80" x="0" y="160" fill={color3} />
        ],
        alternating: [
            <rect width="180" height="120" x="0" y="0" fill={color1} />,
            <rect width="180" height="120" x="180" y="0" fill={color2} />,
            <rect width="180" height="120" x="0" y="120" fill={color1} />,
            <rect width="180" height="120" x="180" y="120" fill={color2} />
        ],
        horizontalStripes: [
            <rect width="360" height="26" x="0" y="26" fill={color1} />,
            <rect width="360" height="26" x="0" y="80" fill={color1} />,
            <rect width="360" height="26" x="0" y="133" fill={color1} />,
            <rect width="360" height="26" x="0" y="187" fill={color1} />
        ],
        verticalStripes: [
            <rect width="40" height="240" x="40" y="0" fill={color1} />,
            <rect width="40" height="240" x="120" y="0" fill={color1} />,
            <rect width="40" height="240" x="200" y="0" fill={color1} />,
            <rect width="40" height="240" x="280" y="0" fill={color1} />
        ],
        checkerboard: [
            <rect width="40" height="40" x="40" y="0" fill={color1} />,
            <rect width="40" height="40" x="120" y="0" fill={color1} />,
            <rect width="40" height="40" x="200" y="0" fill={color1} />,
            <rect width="40" height="40" x="280" y="0" fill={color1} />,
            <rect width="40" height="40" x="0" y="40" fill={color1} />,
            <rect width="40" height="40" x="80" y="40" fill={color1} />,
            <rect width="40" height="40" x="160" y="40" fill={color1} />,
            <rect width="40" height="40" x="240" y="40" fill={color1} />,
            <rect width="40" height="40" x="320" y="40" fill={color1} />,
            <rect width="40" height="40" x="40" y="80" fill={color1} />,
            <rect width="40" height="40" x="120" y="80" fill={color1} />,
            <rect width="40" height="40" x="200" y="80" fill={color1} />,
            <rect width="40" height="40" x="280" y="80" fill={color1} />,
            <rect width="40" height="40" x="0" y="120" fill={color1} />,
            <rect width="40" height="40" x="80" y="120" fill={color1} />,
            <rect width="40" height="40" x="160" y="120" fill={color1} />,
            <rect width="40" height="40" x="240" y="120" fill={color1} />,
            <rect width="40" height="40" x="320" y="120" fill={color1} />,
            <rect width="40" height="40" x="40" y="160" fill={color1} />,
            <rect width="40" height="40" x="120" y="160" fill={color1} />,
            <rect width="40" height="40" x="200" y="160" fill={color1} />,
            <rect width="40" height="40" x="280" y="160" fill={color1} />,
            <rect width="40" height="40" x="0" y="200" fill={color1} />,
            <rect width="40" height="40" x="80" y="200" fill={color1} />,
            <rect width="40" height="40" x="160" y="200" fill={color1} />,
            <rect width="40" height="40" x="240" y="200" fill={color1} />,
            <rect width="40" height="40" x="320" y="200" fill={color1} />
        ],
        diagonal1: <polygon key='1' points="0,0 0,240 360,240" fill={color1} />,
        diagonal2: <polygon key='2' points="360,0 0,240 360,240" fill={color1} />,
        diagonals: [
            <polygon key='1' points="0,0 180,120 0,240" fill={color1} />,
            <polygon key='2' points="360,0 180,120 360,240" fill={color1} /> 
        ]
    }
    return _.sample(Object.values(divisions));
}

const randomOverlay = () => {
    const color = randomColor();
    const overlays = {
        none: [],
        cross: <rect width="60" height="240" x="150" y="0" fill={color} />,
        diagonal1: <polygon points="0,0 40,0 360,200, 360,240, 320,240, 0,40" fill={color} />,
        diagonal2: <polygon points="360,0 320,0 0,200, 0,240, 40,240, 360,40" fill={color} />,
        diagonals: [
            <polygon key='1' points="0,0 40,0 360,200, 360,240, 320,240, 0,40" fill={color} />,
            <polygon key='2' points="360,0 320,0 0,200, 0,240, 40,240, 360,40" fill={color} />
        ],
        triangle: <polygon points="0,0 180,120 0,240" fill={color} />,
        circle: <circle cx="180" cy="120" r="90" fill={color} />,
        romvus: <polygon points="0,120 180,0 360,120 180,240" fill={color} />,
        smallSquare: <rect width="120" height="120" x="0" y="0" fill={color} />,
        bigSquare: <rect width="180" height="160" x="0" y="0" fill={color} />,
        rectangle: <rect width="180" height="120" x="0" y="0" fill={color} />,
        cross2: <rect width="40" height="240" x="100" y="0" fill={color} />
    }
    return _.sample(Object.values(overlays));
}

export default class Flag extends Component {
    shouldComponentUpdate (props) {
        return this.props.nonce !== props.nonce;
    }

    render () {
        const {reference} = this.props;
        const baseColor = randomColor();
        return <svg ref={reference} className="flag" xmlns="http://www.w3.org/2000/svg" version="1.0" x="0" y="0" width="360" height="240">
            <rect width="360" height="240" x="0" y="0" fill={baseColor} />
            <g key="division">{randomDivision()}</g>
            <g key="overlay">{randomOverlay()}</g>
          </svg>;
    }
} 
