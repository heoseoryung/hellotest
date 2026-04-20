export const formatAddressData = (data) => {
  const baseAddress = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
  let extraAddress = '';

  if (data.userSelectedType === 'R') {
    if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) extraAddress += data.bname;
    if (data.buildingName !== '' && data.apartment === 'Y') {
      extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
    }
    if (extraAddress !== '') extraAddress = `(${extraAddress})`;
  }

  return {
    postcode: data.zonecode,
    baseAddress,
    extraAddress,
    addressType: data.userSelectedType === 'R' ? 'ROAD' : 'JIBUN',
  };
};
