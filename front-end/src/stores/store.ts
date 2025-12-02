import {
  combineReducers,
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authSlice, { logout } from "./authSlice";
import { baseApi } from "@/services/baseApi";
// Thêm dòng này

const listenerMiddleware = createListenerMiddleware();
//lắng nghe xem có phải action logout hay không

listenerMiddleware.startListening({
  actionCreator: logout,
  effect: async (_, listenerApi) => {
    listenerApi.dispatch(baseApi.util.resetApiState());
    persistor.purge();
  },
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [PERSIST, PURGE, REHYDRATE, PAUSE, FLUSH],
      },
    }).concat(baseApi.middleware),
  // .concat(reagentApi.middleware), // Thêm dòng này
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
