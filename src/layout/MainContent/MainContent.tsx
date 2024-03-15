import { FC } from "react";

import { useWindowWidthAndHeight } from "../../hooks";
import { formula_background } from "../../assets";

type MainContentProps = {
	children?: React.ReactNode;
};

const styles = {
	content: {
		display: "flex",
		justifyContent: "center",
		alignItems: "flex-start",
		marginTop: "100px",
		marginBottom: "170px",
		padding: "40px",
		overflow: "auto",
	},
	contentMobile: {
		display: "flex",
		justifyContent: "center",
		alignItems: "flex-start",
		marginTop: "100px",
		marginBottom: "170px",
		padding: "30px 0",
		overflow: "hidden",
	},
} as const;

const MainContent: FC<MainContentProps> = ({
	children,
}) => {
	const { isMobile } = useWindowWidthAndHeight();

	return (
		<div
			style={
				isMobile
					? styles.contentMobile
					: styles.content
			}
		>
			{children}
			<img
				src={formula_background}
				alt=""
				className="absolute w-full bottom-[170px] z-[-1]"
			/>
		</div>
	);
};

export default MainContent;
