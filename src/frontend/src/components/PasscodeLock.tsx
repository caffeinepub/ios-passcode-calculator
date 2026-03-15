import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const KEY_LAYOUT: { num: number; letters: string }[] = [
  { num: 1, letters: "" },
  { num: 2, letters: "ABC" },
  { num: 3, letters: "DEF" },
  { num: 4, letters: "GHI" },
  { num: 5, letters: "JKL" },
  { num: 6, letters: "MNO" },
  { num: 7, letters: "PQRS" },
  { num: 8, letters: "TUV" },
  { num: 9, letters: "WXYZ" },
];

function getDayOfWeek(dd: number, mm: number, yyyy: number): string | null {
  if (mm < 1 || mm > 12 || dd < 1 || yyyy < 1900 || yyyy > 2100) return null;
  const date = new Date(yyyy, mm - 1, dd);
  if (date.getMonth() !== mm - 1 || date.getDate() !== dd) return null;
  return DAYS[date.getDay()];
}

export default function PasscodeLock() {
  const [digits, setDigits] = useState<number[]>([]);
  const [key8Label, setKey8Label] = useState("TUV");
  const [showingResult, setShowingResult] = useState(false);
  const [pressedKey, setPressedKey] = useState<number | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setDigits([]);
    setKey8Label("TUV");
    setShowingResult(false);
  }, []);

  const handleDigit = useCallback(
    (d: number) => {
      setDigits((prev) => {
        if (showingResult) {
          if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
          setKey8Label("TUV");
          setShowingResult(false);
          return [d];
        }
        if (prev.length >= 8) return prev;
        const next = [...prev, d];
        if (next.length === 8) {
          const str = next.join("");
          const dd = Number.parseInt(str.slice(0, 2));
          const mm = Number.parseInt(str.slice(2, 4));
          const yyyy = Number.parseInt(str.slice(4, 8));
          const day = getDayOfWeek(dd, mm, yyyy);
          if (day) {
            setKey8Label(day);
            setShowingResult(true);
          } else {
            resetTimerRef.current = setTimeout(reset, 400);
          }
        }
        return next;
      });
    },
    [showingResult, reset],
  );

  const handleCancel = useCallback(() => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    reset();
  }, [reset]);

  const handleKeyPress = (num: number) => {
    setPressedKey(num);
    handleDigit(num);
    setTimeout(() => setPressedKey(null), 120);
  };

  const handleZeroPress = () => {
    setPressedKey(0);
    handleDigit(0);
    setTimeout(() => setPressedKey(null), 120);
  };

  const dotFilled = (i: number) =>
    !showingResult && i < Math.min(digits.length, 4);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "env(safe-area-inset-top, 44px)",
        paddingBottom: "env(safe-area-inset-bottom, 34px)",
        fontFamily:
          "-apple-system, 'SF Pro Display', system-ui, BlinkMacSystemFont, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Title */}
      <div
        style={{
          color: "#fff",
          fontSize: "20px",
          fontWeight: 400,
          letterSpacing: "-0.01em",
          marginBottom: "28px",
        }}
      >
        Enter Passcode
      </div>

      {/* 4 passcode dots */}
      <div
        data-ocid="passcode.panel"
        style={{
          display: "flex",
          gap: "14px",
          marginBottom: "44px",
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.85)",
              background: dotFilled(i) ? "#fff" : "transparent",
            }}
          />
        ))}
      </div>

      {/* Keypad */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 80px)",
          gridTemplateRows: "repeat(4, 80px)",
          gap: "12px",
        }}
      >
        {KEY_LAYOUT.map((key, idx) => {
          const isKey8 = key.num === 8;
          const label = isKey8 ? key8Label : key.letters;
          const isPressed = pressedKey === key.num;
          const ocidIdx = idx + 1;

          return (
            <motion.button
              key={key.num}
              type="button"
              data-ocid={`keypad.button.${ocidIdx}`}
              onPointerDown={() => handleKeyPress(key.num)}
              animate={{ scale: isPressed ? 0.88 : 1 }}
              transition={{ duration: 0.1, ease: "easeInOut" }}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: isPressed
                  ? "rgba(255,255,255,0.35)"
                  : "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                transition: "background 0.1s",
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: "34px",
                  fontWeight: 300,
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                  marginBottom: label ? "2px" : 0,
                }}
              >
                {key.num}
              </span>
              {label && (
                <span
                  style={{
                    color:
                      isKey8 && showingResult
                        ? "rgba(255,255,255,1)"
                        : "rgba(255,255,255,0.9)",
                    fontSize: "10px",
                    fontWeight: isKey8 && showingResult ? 700 : 500,
                    letterSpacing: "0.12em",
                    lineHeight: 1,
                    marginTop: "1px",
                  }}
                >
                  {label}
                </span>
              )}
            </motion.button>
          );
        })}

        {/* Row 4: empty, 0, empty */}
        <div />
        <motion.button
          type="button"
          data-ocid="keypad.button.11"
          onPointerDown={handleZeroPress}
          animate={{ scale: pressedKey === 0 ? 0.88 : 1 }}
          transition={{ duration: 0.1, ease: "easeInOut" }}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background:
              pressedKey === 0
                ? "rgba(255,255,255,0.35)"
                : "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            transition: "background 0.1s",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: "34px",
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
          >
            0
          </span>
        </motion.button>
        <div />
      </div>

      {/* Emergency & Cancel pinned to bottom edge */}
      <div
        style={{
          position: "fixed",
          bottom: "env(safe-area-inset-bottom, 16px)",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          paddingLeft: "40px",
          paddingRight: "40px",
          paddingBottom: "8px",
        }}
      >
        <button
          type="button"
          data-ocid="emergency.button"
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "15px",
            fontWeight: 400,
            cursor: "pointer",
            padding: "8px 0",
            letterSpacing: "-0.01em",
          }}
        >
          Emergency
        </button>
        <button
          type="button"
          data-ocid="cancel.button"
          onClick={handleCancel}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "15px",
            fontWeight: 400,
            cursor: "pointer",
            padding: "8px 0",
            letterSpacing: "-0.01em",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
