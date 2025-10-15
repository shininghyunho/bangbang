function GuestCategory({ title, subTitle }: { title: string; subTitle: string }) {
    return (
    <>
        <p>{title}</p>
        <p>{subTitle}</p>
    </>)
}

export default function GuestModal() {
    return (
        <div>
            <GuestCategory title="성인" subTitle="만 13세 이상"/>
            <GuestCategory title="어린이" subTitle="만 2세 ~ 12세"/>
            <GuestCategory title="유아" subTitle="만 2세 미만"/>
        </div>
    );
}
