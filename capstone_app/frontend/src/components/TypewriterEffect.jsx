import { useEffect, useState } from "react";

export default function TypewriterEffect({
  text = "",
  speed = 50,
  delay = 0,
  loop = false,
  className = "",
}) {
  useEffect(() => {
    console.log('TypewriterEffect mounted', { text });
  }, []);
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let timeout;
    // console.log("is mounted");

    const startTyping = () => {
      if (index < text.length) {
        timeout = setTimeout(() => {
          setDisplayed((prev) => prev + text.charAt(index));
          setIndex((prev) => prev + 1);
        }, speed);
      } else if (loop) {
        timeout = setTimeout(() => {
          setDisplayed("");
          setIndex(0);
        }, 1000);
      }
    };

    const initialDelay = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(timeout);
      clearTimeout(initialDelay);
    };
  }, [index, text, speed, delay, loop]);

  return (
    <span className={className}>
      {displayed}
      <span className="animate-pulse">_</span>
    </span>
  );
}