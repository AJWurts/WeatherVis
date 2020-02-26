// toggle.test.js

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import LabelValue from "../LabelValue";

let container = null;
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    // container *must* be attached to document so events work correctly.
    document.body.appendChild(container);
});

afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
});

it("Test Neither", () => {
    act(() => {
        render(<LabelValue />, container);
    });

    // get ahold of the button element, and trigger some clicks on it
    let labelvalue = document.getElementById("labelvalue");

    expect(labelvalue.children.length).toEqual(0);

});

it("Test Label", () => {
    act(() => {
        render(<LabelValue label="hello"/>, container);
    });

    // get ahold of the button element, and trigger some clicks on it
    let labelvalue = document.getElementById("labelvalue");

    expect(labelvalue.children.length).toEqual(1);

    let labelvalue_label = document.getElementById("labelvalue-label");
    expect(labelvalue_label.innerHTML).toBe('hello');

});

it("Test Value", () => {
    act(() => {
        render(<LabelValue value="hello"/>, container);
    });

    // get ahold of the button element, and trigger some clicks on it
    let labelvalue = document.getElementById("labelvalue");

    expect(labelvalue.children.length).toEqual(1);

    let labelvalue_value = document.getElementById("labelvalue-value");
    expect(labelvalue_value.innerHTML).toBe('hello');

});
