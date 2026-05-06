import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResumeDownload } from "../../components/ResumeDownload";

describe("ResumeDownload", () => {
  it("renders link with download attribute", () => {
    render(<ResumeDownload />);
    const link = screen.getByRole("link", { name: /Download resume/i });
    expect(link).toHaveAttribute("href", "/Sahil_Diwan_Resume.pdf");
    expect(link).toHaveAttribute("download");
  });

  it("dispatches resume_downloaded event on click", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    window.addEventListener("resume_downloaded", spy);
    render(<ResumeDownload />);
    const link = screen.getByRole("link", { name: /Download resume/i });
    // prevent jsdom navigation
    link.addEventListener("click", (e) => e.preventDefault());
    await user.click(link);
    expect(spy).toHaveBeenCalled();
    window.removeEventListener("resume_downloaded", spy);
  });
});
