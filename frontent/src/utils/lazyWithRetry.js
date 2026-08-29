import { lazy } from "react";

export const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasBeenRefreshed = JSON.parse(
      sessionStorage.getItem("lazy_retry_refreshed") || "false"
    );

    try {
      const component = await componentImport();
      sessionStorage.setItem("lazy_retry_refreshed", "false");
      return component;
    } catch (error) {
      if (!pageHasBeenRefreshed) {
        sessionStorage.setItem("lazy_retry_refreshed", "true");
        window.location.reload();
      }
      throw error;
    }
  });
