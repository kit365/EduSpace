/**
 * Public API: https://provinces.open-api.vn/
 * Tỉnh/Thành phố → Quận/Huyện → Phường/Xã
 */

const BASE_URL = 'https://provinces.open-api.vn/api';

export interface Province {
  code: number;
  name: string;
}

export interface District {
  code: number;
  name: string;
}

export interface Ward {
  code: number;
  name: string;
}

export interface ProvinceWithDistricts extends Province {
  districts: District[];
}

export interface DistrictWithWards extends District {
  wards: Ward[];
}

export const addressService = {
  async getProvinces(): Promise<Province[]> {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) throw new Error('Failed to fetch provinces');
    const data = await res.json();
    return Array.isArray(data) ? data.map((p: { code: number; name: string }) => ({ code: p.code, name: p.name })) : [];
  },

  async getDistricts(provinceCode: number): Promise<District[]> {
    const res = await fetch(`${BASE_URL}/p/${provinceCode}?depth=2`);
    if (!res.ok) return [];
    const data: ProvinceWithDistricts = await res.json();
    return data.districts ?? [];
  },

  async getWards(districtCode: number): Promise<Ward[]> {
    const res = await fetch(`${BASE_URL}/d/${districtCode}?depth=2`);
    if (!res.ok) return [];
    const data: DistrictWithWards = await res.json();
    return data.wards ?? [];
  },
};
