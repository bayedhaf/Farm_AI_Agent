'use client'
import { useState } from "react";

export default function Language() {
    const [isLanguage, setIsLanguage] = useState("en");
    
    const renderLanguageText = () => {
        if(isLanguage === "en"){
            return <div>Select Language</div>
        } else if(isLanguage === "om"){
            return <div>Afaan filadhu </div>
        } else if(isLanguage === "am"){
            return <div>Qonka miratu</div>
        } else {
            return <div>Select Language</div>
        }
    }

    return (
        <div className="">
            {renderLanguageText()}

        
            
            <select value={isLanguage} onChange={(e) => setIsLanguage(e.target.value)} className="border p-1">
                <option value="en">English</option>
                <option value="om">Afaan Oromo</option>
                <option value="am">Amharic</option>
            </select>
        </div>
    )
}