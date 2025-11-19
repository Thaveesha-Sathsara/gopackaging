import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
  // Add custom class for toasts
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
    // Add custom class for modal alerts
    customClass: {
      popup: "swal2-modal-popup",
    },
  });
};

export const createAlert = (title, text, icon = "success") => {
  // Added icon parameter for flexibility
  Swal.fire({
    icon: icon, // Use the passed icon, defaults to 'success'
    title,
    text,
    // Add custom class for modal alerts
    customClass: {
      popup: "swal2-modal-popup",
    },
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
      allowOutsideClick: false, // Prevent interaction outside modal
      allowEscapeKey: false, // Prevent closing with escape key
      // Add custom class for modal alerts
      customClass: {
        popup: "swal2-modal-popup",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          // Ensure updateFunction is awaited if it returns a Promise
          const res = updateFunction();
          if (res && typeof res.then === "function") {
            // Check if it's a promise
            res
              .then(() => {
                Swal.fire({
                  title: isDraft ? "Drafted!" : "Updated!",
                  text: successMessage,
                  icon: "success",
                  customClass: {
                  popup: "swal2-modal-popup",
                  },
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
                });
                reject("error");
              });
          } else {
            // Not a promise
            Swal.fire({
              title: isDraft ? "Drafted!" : "Updated!",
              text: successMessage,
              icon: "success",
              customClass: {
               popup: "swal2-modal-popup",
              },
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
        });
        resolve("cancelled"); // Resolve with 'cancelled'
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
    // Changed to Promise to handle async deleteFunction
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
      allowOutsideClick: false, // Prevent interaction outside modal
      allowEscapeKey: false, // Prevent closing with escape key
      // Add custom class for modal alerts
      customClass: {
        popup: "swal2-modal-popup",
      },
    }).then(async (result) => {
      // Made this async to await deleteFunction
      if (result.isConfirmed) {
        try {
          await deleteFunction(); // Await the delete function
          Swal.fire({
            title: "Deleted!",
            text: successMessage,
            icon: "success",
            customClass: {
              popup: "swal2-modal-popup",
            },
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
          });
          resolve("error"); // Resolve with 'error'
        }
      } else {
        Swal.fire({
          title: "Cancelled",
          text: "Operation cancelled.",
          icon: "info",
          customClass: {
            popup: "swal2-modal-popup",
          },
        });
        resolve("cancelled"); // Resolve with 'cancelled'
      }
    });
  });
};

export const errorAlert = (title, text) => {
  Swal.fire({
    icon: "error",
    title,
    html: text,
    // Add custom class for modal alerts
    customClass: {
      popup: "swal2-modal-popup",
    },
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
      allowOutsideClick: false, // Prevent interaction outside modal
      allowEscapeKey: false, // Prevent closing with escape key
      // Add custom class for modal alerts
      customClass: {
        popup: "swal2-modal-popup",
      },
    });

    if (result.isConfirmed) {
      logout();
      Swal.fire({
        title: "Logged Out!",
        text: "You have been successfully logged out.",
        icon: "success",
        timer: 2000, // Show for 2 seconds
        showConfirmButton: false,
        // Add custom class for toasts (even if it's a temporary modal-like success)
        customClass: {
          popup: "swal2-toast-popup",
        },
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
    });
  }
};
