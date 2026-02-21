import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
            >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
            </select>
        </div>
    );
}
