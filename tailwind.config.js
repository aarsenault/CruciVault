module.exports = {
  theme: {
    extend: {
      keyframes: {
        shake: {
          "0%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(8deg)" },
          "50%": { transform: "rotate(-4deg)" },
          "75%": { transform: "rotate(4deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "open-door": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(-75deg)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        shake: "shake 0.5s ease-in-out forwards",
        "open-door": "open-door 1s ease-in-out forwards",
        "fade-in": "fade-in 0.3s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};
