import Swal from "sweetalert2";

// 1. HELPER: This forces the SweetAlert container to be above Shadcn Dialogs
const highZIndexFix = {
  didOpen: () => {
    const container = Swal.getContainer();
    if (container) {
      // Shadcn modals are usually 50. We set this to 99999 to be safe.
      container.style.zIndex = "99999"; 
    }
  }
};

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
    // Apply Z-Index fix to toasts too
    const container = Swal.getContainer();
    if (container) container.style.zIndex = "99999";
  },
  customClass: {
    popup: "swal2-toast-popup",
  },
});

export const toastAlert = (icon, title) => {
  Toast.fire({
    icon: icon,
    title: title,
  });
};

export const infoAlert = (title, text) => {
  Swal.fire({
    icon: "info",
    title,
    text,
    customClass: {
      popup: "swal2-modal-popup",
    },
    ...highZIndexFix, // <--- Added Fix
  });
};

export const createAlert = (title, text, icon = "success") => {
  Swal.fire({
    icon: icon,
    title,
    text,
    customClass: {
      popup: "swal2-modal-popup",
    },
    ...highZIndexFix, // <--- Added Fix
  });
};

export const updateAlert = (
  title,
  text,
  confirmButtonText,
  successMessage,
  errorMessage,
  updateFunction,
  isDraft = false
) => {
  return new Promise((resolve, reject) => {
    Swal.fire({
      title,
      text,
      icon: "info",
      iconColor: "#2196F3",
      showCancelButton: true,
      confirmButtonColor: "#1d4ed8",
      cancelButtonColor: "#6B7280",
      confirmButtonText,
      reverseButtons: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: "swal2-modal-popup",
      },
      ...highZIndexFix, // <--- Added Fix
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          const res = updateFunction();
          if (res && typeof res.then === "function") {
            res
              .then(() => {
                Swal.fire({
                  title: isDraft ? "Drafted!" : "Updated!",
                  text: successMessage,
                  icon: "success",
                  customClass: {
                    popup: "swal2-modal-popup",
                  },
                  ...highZIndexFix, // <--- Added Fix
                });
                resolve("success");
              })
              .catch((error) => {
                console.error(errorMessage, error);
                Swal.fire({
                  title: "Error!",
                  text: errorMessage,
                  icon: "error",
                  customClass: {
                    popup: "swal2-modal-popup",
                  },
                  ...highZIndexFix, // <--- Added Fix
                });
                reject("error");
              });
          } else {
            Swal.fire({
              title: isDraft ? "Drafted!" : "Updated!",
              text: successMessage,
              icon: "success",
              customClass: {
                popup: "swal2-modal-popup",
              },
              ...highZIndexFix, // <--- Added Fix
            });
            resolve("success");
          }
        } catch (error) {
          console.error(errorMessage, error);
          Swal.fire({
            title: "Error!",
            text: errorMessage,
            icon: "error",
            customClass: {
              popup: "swal2-modal-popup",
            },
            ...highZIndexFix, // <--- Added Fix
          });
          reject("error");
        }
      } else {
        Swal.fire({
          title: "Cancelled",
          text: "Operation cancelled.",
          icon: "info",
          customClass: {
            popup: "swal2-modal-popup",
          },
          ...highZIndexFix, // <--- Added Fix
        });
        resolve("cancelled");
      }
    });
  });
};

export const deleteAlert = (
  title,
  text,
  confirmButtonText,
  successMessage,
  errorMessage,
  deleteFunction
) => {
  return new Promise((resolve) => {
    Swal.fire({
      title,
      text,
      icon: "warning",
      iconColor: "#FFBF00",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText,
      reverseButtons: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: "swal2-modal-popup",
      },
      ...highZIndexFix, // <--- Added Fix
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteFunction();
          Swal.fire({
            title: "Deleted!",
            text: successMessage,
            icon: "success",
            customClass: {
              popup: "swal2-modal-popup",
            },
            ...highZIndexFix, // <--- Added Fix
          });
          resolve("success");
        } catch (error) {
          console.error(errorMessage, error);
          Swal.fire({
            title: "Error!",
            text: errorMessage,
            icon: "error",
            customClass: {
              popup: "swal2-modal-popup",
            },
            ...highZIndexFix, // <--- Added Fix
          });
          resolve("error");
        }
      } else {
        Swal.fire({
          title: "Cancelled",
          text: "Operation cancelled.",
          icon: "info",
          customClass: {
            popup: "swal2-modal-popup",
          },
          ...highZIndexFix, // <--- Added Fix
        });
        resolve("cancelled");
      }
    });
  });
};

export const errorAlert = (title, text) => {
  Swal.fire({
    icon: "error",
    title,
    html: text,
    customClass: {
      popup: "swal2-modal-popup",
    },
    ...highZIndexFix, // <--- Added Fix
  });
};

export const logoutAlert = async (logout) => {
  try {
    const result = await Swal.fire({
      title: "Logout?",
      text: "You will be logged out of the system.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Logout",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: "swal2-modal-popup",
      },
      ...highZIndexFix, // <--- Added Fix
    });

    if (result.isConfirmed) {
      logout();
      Swal.fire({
        title: "Logged Out!",
        text: "You have been successfully logged out.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-toast-popup",
        },
        ...highZIndexFix, // <--- Added Fix
      });
    }
  } catch (error) {
    console.error("Error logging out:", error);
    Swal.fire({
      title: "Failed!",
      text: "Failed to log out. Please try again.",
      icon: "error",
      customClass: {
        popup: "swal2-modal-popup",
      },
      ...highZIndexFix, // <--- Added Fix
    });
  }
};