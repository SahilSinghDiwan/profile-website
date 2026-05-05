import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DemoEmbed } from "../../components/DemoEmbed";

describe("DemoEmbed", () => {
  it("renders iframe with sandbox + lazy + title when demoUrl is set", () => {
    const { container } = render(<DemoEmbed demoUrl="https://example.com" title="Test" />);
    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe!.getAttribute("sandbox")).toContain("allow-scripts");
    expect(iframe!.getAttribute("loading")).toBe("lazy");
    expect(iframe!.getAttribute("title")).toContain("Test");
  });

  it("renders nothing without demoUrl", () => {
    const { container } = render(<DemoEmbed title="Test" />);
    expect(container.firstChild).toBeNull();
  });
});
