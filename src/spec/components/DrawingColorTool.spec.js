import React from "react";
import { render, screen } from "@testing-library/react";
import DrawingColorTool from "../../components/DrawingColorTool";
import * as reactRedux from "react-redux";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

describe("DrawingColorTool", () => {
  const useSelectorMock = reactRedux.useSelector;

  beforeEach(() => {
    useSelectorMock.mockImplementation((selector) => selector(mockStore));
  });

  afterEach(() => {
    useSelectorMock.mockClear();
  });

  const mockStore = {
    lineStyle: {
      lineColor: "red",
    },
  };

  it("should show selected lineColor", () => {
    render(<DrawingColorTool />);

    const tag = screen.getByRole("heading");

    expect(tag).toHaveTextContent("red");
  });
});
