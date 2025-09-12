import type { UserInfo } from "@/entity";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserState = {
  userInfo: Partial<UserInfo>;
};
type UserActions = {
  setUserInfo: (userInfo: Partial<UserInfo> | UserInfo) => void;
  updateUserInfo: (userInfo: Partial<UserInfo>) => void;
  clearUserInfo: () => void;
  getUserInfo: () => Partial<UserInfo>;
};
type UserStore = UserState & {
  actions: UserActions;
};
const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userInfo: {},
      actions: {
        setUserInfo: (userInfo) => {
          set({ userInfo });
        },
        updateUserInfo: (userInfo) => {
          set((state) => ({
            userInfo: { ...state.userInfo, ...userInfo },
          }));
        },
        clearUserInfo: () => {
          set({ userInfo: {} });
        },
        getUserInfo: () => {
          return get().userInfo;
        },
      },
    }),
    {
      name: "userStore",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ userInfo: state.userInfo }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("Failed to hydrate user store:", error);
          } else if (state) {
            console.log("User store hydrated successfully");
          }
        };
      },
    },
  ),
);

// Selectors
export const useUserInfo = () => useUserStore((state) => state.userInfo);
// Actions
export const useUserActions = () => useUserStore((state) => state.actions);

// Utility functions
export const getUserInfoSync = () => {
  return useUserStore.getState().userInfo;
};

export const isUserLoggedIn = () => {
  const userInfo = getUserInfoSync();
  return !!userInfo.uuid;
};

export default useUserStore;
