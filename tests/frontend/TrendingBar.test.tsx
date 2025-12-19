import "./setup";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, beforeEach, describe, expect, it } from "vitest";
import { TrendingBar } from "../../components/TrendingBar";
import { useQuery } from "convex/react";
import { useEngagementTracker } from "../../hooks/useEngagementTracker";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
}));

vi.mock("../../hooks/useEngagementTracker", () => ({
  useEngagementTracker: vi.fn(),
}));

const useQueryMock = vi.mocked(useQuery);
const useEngagementTrackerMock = vi.mocked(useEngagementTracker);

const renderTrendingBar = () =>
  render(
    <MemoryRouter>
      <TrendingBar />
    </MemoryRouter>
  );

describe("TrendingBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.mockReset();
    useEngagementTrackerMock.mockReset();

    useEngagementTrackerMock.mockReturnValue({
      trackEvent: vi.fn(),
      trackShare: vi.fn(),
      userId: "anon-user",
      sessionId: "session-id",
    });
  });

  it("renders trending articles when data is available", () => {
    useQueryMock.mockReturnValue([
      { _id: "article-1", title: "Nota destacada", section: "politica" },
      { _id: "article-2", title: "Otra nota", section: "economia" },
    ]);

    renderTrendingBar();

    expect(screen.getAllByText("Nota destacada")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Otra nota")[0]).toBeInTheDocument();
  });

  it("shows fallback and tracks event when there are no internal articles", () => {
    const trackEventSpy = vi.fn();
    useEngagementTrackerMock.mockReturnValue({
      trackEvent: trackEventSpy,
      trackShare: vi.fn(),
      userId: "anon-user",
      sessionId: "session-id",
    });

    useQueryMock.mockReturnValue([]);

    renderTrendingBar();

    expect(
      screen.getByText("No hay noticias internas publicadas por ahora.")
    ).toBeInTheDocument();
    expect(trackEventSpy).toHaveBeenCalledWith({
      eventType: "trending_empty_state",
      metadata: { surface: "trending_bar" },
    });
  });

  it("renders loading placeholders while the query is pending", () => {
    useQueryMock.mockReturnValue(undefined);

    const { container } = renderTrendingBar();

    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("tracks clicks on trending articles", () => {
    const trackEventSpy = vi.fn();
    useEngagementTrackerMock.mockReturnValue({
      trackEvent: trackEventSpy,
      trackShare: vi.fn(),
      userId: "anon-user",
      sessionId: "session-id",
    });

    useQueryMock.mockReturnValue([
      { _id: "article-1", title: "Nota clickeable", section: "politica" },
    ]);

    renderTrendingBar();

    const link = screen.getAllByRole("link", { name: /nota clickeable/i })[0];
    fireEvent.click(link);

    expect(trackEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "trending_click",
        articleId: "article-1",
      })
    );
  });
});

