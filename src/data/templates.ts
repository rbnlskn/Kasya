
export interface WalletTemplate {
    name: string;
    bg: string;
    text: string;
    type: string;
}

export const WALLET_TEMPLATES: WalletTemplate[] = [
    // E-Wallets
    { name: 'Cash', bg: 'bg-[#14B8A6]', text: 'text-[#FFFFFF]', type: 'Cash' },
    { name: 'GCash', bg: 'bg-[#007CFF]', text: 'text-[#FFFFFF]', type: 'E-Wallet' },
    { name: 'Maya', bg: 'bg-[#000000]', text: 'text-[#75EEA5]', type: 'E-Wallet' },
    { name: 'GrabPay', bg: 'bg-[#00B14F]', text: 'text-[#FFFFFF]', type: 'E-Wallet' },
    
    // Digital Banks
    { name: 'GoTyme', bg: 'bg-[#2D2D3A]', text: 'text-[#00E5FF]', type: 'Digital Bank' },
    { name: 'CIMB', bg: 'bg-[#E50019]', text: 'text-[#FFFFFF]', type: 'Digital Bank' },
    { name: 'MariBank', bg: 'bg-[#FF5300]', text: 'text-[#FFFFFF]', type: 'Digital Bank' },
    { name: 'Tonik', bg: 'bg-[#5D2E8E]', text: 'text-[#FFFFFF]', type: 'Digital Bank' },
    
    // Traditional Banks
    { name: 'BPI', bg: 'bg-[#B11116]', text: 'text-[#FFFFFF]', type: 'Bank' },
    { name: 'UnionBank', bg: 'bg-[#FF8000]', text: 'text-[#FFFFFF]', type: 'Bank' },
    { name: 'RCBC', bg: 'bg-[#0066CC]', text: 'text-[#FFFFFF]', type: 'Bank' },
    { name: 'Landbank', bg: 'bg-[#74BC44]', text: 'text-[#FFFFFF]', type: 'Bank' },
    { name: 'Security Bank', bg: 'bg-[#003767]', text: 'text-[#FFFFFF]', type: 'Bank' },
    { name: 'PNB', bg: 'bg-[#003F87]', text: 'text-[#FFFFFF]', type: 'Bank' },
    { name: 'Chinabank', bg: 'bg-[#BC1E2D]', text: 'text-[#FFFFFF]', type: 'Bank' },
];
