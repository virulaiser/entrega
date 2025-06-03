import React from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";

import AppIncome from "./navigation/AppIncome";
import HomeScreen from "./components/HomeScreens";

export default function App() {
    return <Provider store={store}>
        {/*<AppIncome />  */}
    <HomeScreen />
    </Provider>;
}
