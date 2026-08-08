/* Default axe configuration used across all a11y tests */
export const axeConfig = {
  rules: [
    /* Enforce WCAG 2.1 AA — non-negotiable per constitution */
    { id: "color-contrast", enabled: true },
  ],
};

/* Helper: run axe on a document fragment and return violations */
export async function runAxe(container, config = {}) {
  const { default: axe } = await import("axe-core");
  axe.configure({ ...axeConfig, ...config });

  return new Promise((resolve, reject) => {
    axe.run(container, {}, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}
