import { MouseEventHandler } from "react";
import { CloseIcon } from "../../CloseIcon";

export const ModalSettingHeader = ({
	close,
}: {
	close?: MouseEventHandler;
}) => {
	return (
		<div className="flex w-full flex-col gap-3">
			<div className="flex items-center justify-between gap-3 self-stretch">
				<span className="text-2xl font-['Russo_One'] leading-[29px]">
					Adjust Parameter
				</span>
				<div className="flex items-center justify-center">
					<CloseIcon onClick={close} />
				</div>
			</div>
		</div>
	);
};
