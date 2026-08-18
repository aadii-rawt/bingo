import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../lib/api";

const UserContext = createContext(null);

export const UserProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [accessToken, setAccessToken] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const loginUser = (
    userData,
    token
  ) => {
    setUser(userData);
    setAccessToken(token);
  };

  const logoutUser = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(error);
    }

    setUser(null);
    setAccessToken(null);
  };

  /*
  |--------------------------------------------------------------------------
  | CHECK REFRESH TOKEN ON APP START
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const restoreSession =
      async () => {
        try {
          const response =
            await api.post(
              "/auth/refresh"
            );

          const data =
            response?.data?.data;

          if (!data?.user) {
            throw new Error(
              "Invalid session"
            );
          }

          setUser(data.user);

          setAccessToken(
            data.accessToken
          );
        } catch (error) {
          console.log(
            "Session expired"
          );

          setUser(null);
          setAccessToken(null);
        } finally {
          setLoading(false);
        }
      };

    restoreSession();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        accessToken,
        loading,
        setUser,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(
    UserContext
  );
};