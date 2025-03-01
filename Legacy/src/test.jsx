export function Test(data) {
    //smtng.smq
        if (data.smtdata %2 == 0) {
            return (
        
                    <div >
                        <h1 className="text-green-500 font-mono"><span className="text-xl text-amber-200">{data.smtdata}</span> is a even number</h1>
                    </div>

            )
        }else{
            return (
                <>
                    <div>
                        <h1>Not a even Number...</h1>
                    </div>
                </>
            )
        }
}