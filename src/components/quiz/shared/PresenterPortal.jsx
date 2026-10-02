import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function PresenterPortal({
  presenterWindow: presenterWindowOrGetter,
  children,
  running,
  closeOnUnmount = true,
  onClose
}) {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    // A getter keeps the Window object out of props, which React dev tooling can't inspect cross-origin.
    const presenterWindow = typeof presenterWindowOrGetter === "function"
      ? presenterWindowOrGetter()
      : presenterWindowOrGetter;
    if (!presenterWindow || presenterWindow.closed || !running) return;

    const popupDocument = presenterWindow.document;
    popupDocument.title = "Quiz Controller";
    popupDocument.body.replaceChildren();
    popupDocument.body.style.margin = "0";

    document.querySelectorAll('link[rel="stylesheet"], style').forEach((stylesheet) => {
      popupDocument.head.appendChild(stylesheet.cloneNode(true));
    });

    const baseStyles = popupDocument.createElement("style");
    baseStyles.textContent = "html, body, #quiz-controller-root { min-height: 100%; } body { margin: 0; }";
    popupDocument.head.appendChild(baseStyles);

    const div = popupDocument.createElement("div");
    div.id = "quiz-controller-root";
    popupDocument.body.appendChild(div);
    setContainer(div);

    const closedWindowTimer = window.setInterval(() => {
      if (presenterWindow.closed) {
        setContainer(null);
        onClose?.(null);
        window.clearInterval(closedWindowTimer);
      }
    }, 500);

    return () => {
      window.clearInterval(closedWindowTimer);
      if (closeOnUnmount && !presenterWindow.closed) presenterWindow.close();
    };
  }, [presenterWindowOrGetter, running, closeOnUnmount, onClose]);

  if (!container) return null;

  return createPortal(children, container);
}
