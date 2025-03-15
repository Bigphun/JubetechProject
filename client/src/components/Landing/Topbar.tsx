import { useState  } from "react";
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Carousel from 'react-bootstrap/Carousel';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { checkUser } from "../../services/authorize.ts";

import "../../assets/css/landing/topbar.css";
import { FaAngleDown, FaAngleRight, FaSistrix, FaCartShopping, FaNewspaper, FaBars } from "react-icons/fa6";

interface TopbarProp {
    modalStatus: boolean,
    setShowModal: (value: boolean | ((prev: boolean) => boolean)) => void,
    setTypeModal: (value: number | ((prev: number) => number)) => void
}

const MUIButton = styled(Button)({
    boxShadow: "none",
    fontSize: "0.8rem",
    color: "#c13dff",
    borderColor: "#c13dff",
    "&:hover": {
        backgroundColor: "#c13dff10",
        boxShadow: "0px 1px 2px 1px #00000030"
    }
});



function ButtonContainer({ modalStatus, setShowModal, setTypeModal }:TopbarProp) {
    const [searchCourse, setSearchCourse] = useState<string>("");
    return (
        <div className="btn-container">
            <button
                id="signin-btn"
                onClick={() => {
                    setShowModal(!modalStatus)
                    setTypeModal(0);
                }}
            >
                เข้าสู่ระบบ
            </button>
            <button
                id="signup-btn"
                onClick={() => {
                    setShowModal(!modalStatus)
                    setTypeModal(1);
                }}
            >
                สมัครสมาชิก
            </button>
        </div>
    );
}

export default function Topbar({ modalStatus, setShowModal, setTypeModal }:TopbarProp) {
    const [showOffcanvas, setShowOffCanvas] = useState<boolean>(false); // Canvas state
    const [showPopover, setShowPopover] = useState<boolean>(false); // Popover state
    const [carouselIndex, setCarouselIndex] = useState<number>(0); // Carousel state
    
    // Data Section



    // Render
    return (
        <nav className="topbar">
            {/* Left Section */}
            <div className="left-container">
                {/* Logo */}
                <div className="logo-container">
                    <a href="/"><span>Jube<span>Tech</span></span></a>
                </div>
                {/* Category */}
                <div className={"category-container " + (showPopover ? "active" : null)}>
                    <MUIButton
                        className={showPopover ? "active" : ""}
                        id="category-tab"
                        aria-describedby="category-tab"
                        variant="outlined"
                        endIcon={<FaAngleDown size={14} />}
                        onMouseEnter={() => setShowPopover(true)}
                        onClick={() => setShowPopover(!showPopover)}
                    >
                        <span>หมวดหมู่</span>
                    </MUIButton>
                    <div
                        className="category-info"
                        style={{display: showPopover ? "flex" : "none"}}
                        onMouseLeave={() => setShowPopover(false)}
                    >
                        <div className="main-category">
                            <p>ค้นหาหมวดหมู่ที่คุณสนใจ</p>
                            <ul>
                                <li>
                                    Web Developer
                                    <i><FaAngleRight /></i>
                                </li>
                                <li>
                                    Mobile Developer
                                    <i><FaAngleRight /></i>
                                </li>
                                <li>
                                    Desktop Developer
                                    <i><FaAngleRight /></i>
                                </li>
                                <li>
                                    UX/UI Designer
                                    <i><FaAngleRight /></i>
                                </li>
                                <li>
                                    IOT Developer
                                    <i><FaAngleRight /></i>
                                </li>
                                <li>
                                    Cybersecurity
                                    <i><FaAngleRight /></i>
                                </li>
                                <li>
                                    Data Science
                                    <i><FaAngleRight /></i>
                                </li>
                                <li>
                                    Prompt Engineer
                                    <i><FaAngleRight /></i>
                                </li>
                            </ul>
                        </div>
                        <div className="sub-category">
                            <ul>
                                <li>Javascript</li>
                                <li>Typescript</li>
                                <li>Java</li>
                                <li>Python</li>
                                <li>Kotlin</li>
                                <li>React.js</li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Search */}
                <div className="search-container">
                    <input type="text" placeholder="ค้นหาคอร์สเรียน..."
                    // onChange={(e) => {
                    //     setSearchCourse(e.target.value)
                    // }}
                    />
                    <i><FaSistrix
                    
                    /></i>
                </div>
            </div>
            {/* Right Section */}
            <div className="right-container">
                {/* Link */}
                <a href="#">
                    สมัครเป็นติวเตอร์
                </a>
                <a href="#">
                    การเรียนรู้ของเรา
                </a>
                {/* Cart */}
                <a href="#"><i><FaCartShopping /></i></a>
                {/* Notification */}
                <a href="#"><i><FaNewspaper /></i></a>
                {checkUser()
                    ?
                    ""
                    :
                    <ButtonContainer
                        modalStatus={modalStatus}
                        setShowModal={setShowModal}
                        setTypeModal={setTypeModal}
                    />
                }
                <div className="sidetab-container" onClick={() => setShowOffCanvas(true)}>
                    <i><FaBars /></i>
                </div>
            </div>

            <Offcanvas show={showOffcanvas} placement="end" onHide={() => setShowOffCanvas(false)}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>รายการเมนู</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Carousel activeIndex={carouselIndex}>
                        <Carousel.Item>
                            123
                        </Carousel.Item>
                        <Carousel.Item>
                            456
                        </Carousel.Item>
                    </Carousel>
                </Offcanvas.Body>
            </Offcanvas>
        </nav>
    );
}