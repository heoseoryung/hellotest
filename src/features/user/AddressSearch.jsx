import { formatAddressData } from '@/shared/utils/formatters';

export default function AddressSearch({ onSelect }) {
  const handleSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        const result = formatAddressData(data);
        onSelect(result);
      },
    }).open();
  };

  return (
    <button
      type="button"
      onClick={handleSearch}
      className="px-4 py-2 bg-[#fee500] text-black rounded-md font-bold hover:bg-[#fada0a] transition-all"
    >
      우편번호 찾기
    </button>
  );
}
