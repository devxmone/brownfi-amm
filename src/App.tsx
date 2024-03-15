import { Buffer } from "buffer";

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Layout, ConfigProvider, theme } from "antd";

import { CustomHeader, MainContent, CustomFooter } from "./layout";
import { GlobalProvider } from "./context/GlobalProvider";
import { StarknetProvider } from "./starknet-provider";
import { publicRoutes } from "./routes";
import "./styles/App.css";
import DisplayPane from "components/displayPane/DisplayPane";

const styles = {
	layout: {
		width: "100vw",
		height: "100vh",
		overflow: "auto",
		fontFamily: "Montserrat, sans-serif",
	},
} as const;

function App() {
	const { defaultAlgorithm, darkAlgorithm } = theme;
	const [isDarkMode, setIsDarkMode] = useState(true);
	if (!window.Buffer) window.Buffer = Buffer;

	return (
		<Router>
			<StarknetProvider>
				<GlobalProvider>
					<ConfigProvider
						theme={{
							algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
						}}
					>
						<Layout style={styles.layout}>
							<CustomHeader
								isDarkMode={isDarkMode}
								setIsDarkMode={setIsDarkMode}
							/>
							<MainContent>
								<DisplayPane isDarkMode={isDarkMode} />
								{/* <Routes>
									{publicRoutes.map((route, index) => {
										const Page = route.element;
										return (
											<Route
												key={index}
												path={route.path}
												element={<Page />}
											></Route>
										);
									})}
								</Routes> */}
							</MainContent>
							<CustomFooter />
						</Layout>
					</ConfigProvider>
				</GlobalProvider>
			</StarknetProvider>
		</Router>
	);
}

export default App;
