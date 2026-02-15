export default function Watermark() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
            <img
                src="https://i.ibb.co/v6WM95xK/2.jpg"
                alt="Watermark"
                className="w-[70%] max-w-[1000px] opacity-10 object-contain filter grayscale"
            />
        </div>
    )
}
