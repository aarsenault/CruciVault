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
      },
      animation: {
        shake: "shake 0.5s ease-in-out forwards",
        "open-door": "open-door 1s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};
