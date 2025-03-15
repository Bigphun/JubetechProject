import {
    FaHouse,
    FaBookOpenReader,
    FaUser,
    FaSitemap,
    FaUserPlus
} from "react-icons/fa6";

import { IconType } from "react-icons";
import { MdDiscount } from "react-icons/md";

export interface Menu {
    title: string,
    href: string,
    order: number,
    icon: IconType,
    roles: string[]
}

export const menus:Menu[] = [
    { 
        title: "แผนภูมิภาพรวม",
        href: "/dashboard",
        icon: FaHouse,
        order: 0,
        roles: ["Tutor"]
    },
    {
        title: "จัดการคอร์สเรียน",
        href: "/dashboard/course-management",
        icon: FaBookOpenReader,
        order: 1,
        roles: ["Tutor"]
    },
    {
        title: "จัดการผู้ใช้งาน",
        href: "/dashboard/user-management",
        icon: FaUser,
        order: 2,
        roles: ["Admin"]
    },
    {
        title: "จัดการหมวดหมู่",
        href: "/dashboard/category-management",
        icon: FaSitemap,
        order: 3,
        roles: ["Admin"]
    },
    {
        title: "จัดการบทบาท",
        href: "/dashboard/role-management",
        icon: FaUserPlus,
        order: 4,
        roles: ["Admin"]
    },
    {
        title: "จัดการโปรโมชั่น",
        href: "/dashboard/promotion-management",
        icon: MdDiscount ,
        order: 5,
        roles: ["Admin"]
    },
]