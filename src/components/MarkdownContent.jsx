import React from "react";

/**
 * Renders pre-compiled HTML from the markdown overview.
 * The HTML is generated at build-time by compile-data.js using `marked`.
 * We use dangerouslySetInnerHTML because the content is fully controlled
 * by our own compilation script — never from user input.
 */
export default function MarkdownContent({ htmlContent }) {
  if (!htmlContent) {
    return (
      <div className="markdown-body">
        <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
          No study guide available for this chapter yet.
        </p>
      </div>
    );
  }

  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
