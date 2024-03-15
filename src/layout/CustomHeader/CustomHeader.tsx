import { FC, useState } from "react";
import { Layout, Typography } from "antd";
import { logo } from "../../assets";
import ConnectAccount from "../../components/Account/ConnectAccount";
import ChainSelector from "../../components/ChainSelector";
import { useWindowWidthAndHeight } from "../../hooks";
import { twMerge } from "tailwind-merge";
import { Link, useMatch } from "react-router-dom";

const { Header } = Layout;

const styles = {
	header: {
		position: "fixed",
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
		backgroundColor: "transparent",
		padding: "20px 44px",
		zIndex: 1,
	},
	headerRight: {
		display: "flex",
		gap: "10px",
		alignItems: "center",
		fontSize: "15px",
		fontWeight: "600",
	},
} as const;

type CustomHeaderProps = {
	isDarkMode: boolean;
	setIsDarkMode: React.Dispatch<
		React.SetStateAction<boolean>
	>;
};

const CustomHeader: FC<CustomHeaderProps> = ({
	isDarkMode,
	setIsDarkMode,
}) => {
	const { isMobile } = useWindowWidthAndHeight();
	// const location = useNoti();
	const [
		isShowModalConnect,
		setIsShowModalConnect,
	] = useState(false);
	// const toggleColorMode = () => {
	//   setIsDarkMode((previousValue) => !previousValue);
	// };

	return (
		<Header
			style={{
				...styles.header,
				padding: isMobile
					? "15px 5px 0 5px"
					: "20px 44px",
			}}
		>
			<div className="flex gap-[44px]">
				<img
					src={logo}
					alt=""
				/>
				<div className="flex gap-4 items-center">
					<Link
						to="/swap"
						className="flex px-4 py-2 h-10"
					>
						<span
							className={twMerge(
								"text-base font-['Russo_One'] hover:text-[#27E3AB] transition-all",
								Boolean(useMatch("/swap"))
									? "text-[#27E3AB]"
									: "text-[#ffffff80]"
							)}
						>
							Swap
						</span>
					</Link>
					<Link
						to="/pools"
						className="flex px-4 py-2 h-10"
					>
						<span
							className={twMerge(
								"text-base font-['Russo_One'] hover:text-[#27E3AB] transition-all",
								Boolean(useMatch("/pools"))
									? "text-[#27E3AB]"
									: "text-[#ffffff80]"
							)}
						>
							Pools
						</span>
					</Link>
				</div>
			</div>
			<div className="flex gap-4">
				<ChainSelector />
				<ConnectAccount />
			</div>
		</Header>
	);
};

export default CustomHeader;

type LogoProps = {
	isDarkMode: boolean;
};

export const Logo: FC<LogoProps> = ({
	isDarkMode,
}) => {
	const { isMobile } = useWindowWidthAndHeight();

	return (
		<div>
			<img
				src={logo}
				alt="web3Boilerplate_logo"
			/>
		</div>
	);
};
