import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Rating, Button, Tabs, Tab, Box, CircularProgress } from "@mui/material";
import { FaPlay, FaRegClock, FaSignal, FaGlobe, FaRegCalendarAlt, FaRegFileAlt, FaInfinity, FaMobileAlt, FaTrophy } from "react-icons/fa";

import "../assets/css/pages/course-detail.css";
import TestImage from "../assets/img/landing/course-test.png";
import Topbar from "../components/Landing/Topbar";

const mockCourses = [
  {
    id: 1,
    thumbnail: TestImage,
    title: "Node.js 2025 - การพัฒนาเว็บแอปพลิเคชันด้วย Node.js แบบมืออาชีพ",
    description: "เรียนรู้การพัฒนาเว็บแอปพลิเคชันด้วย Node.js ตั้งแต่พื้นฐานจนถึงขั้นสูง พร้อมทั้งการใช้งาน Express, MongoDB และ REST API",
    longDescription: "คอร์สนี้ออกแบบมาสำหรับนักพัฒนาที่ต้องการเรียนรู้การสร้างเว็บแอปพลิเคชันด้วย Node.js แบบครบวงจร คุณจะได้เรียนรู้ตั้งแต่พื้นฐานไปจนถึงเทคนิคขั้นสูง การจัดการฐานข้อมูล การสร้าง RESTful API และการนำไปใช้งานจริง\n\nคอร์สนี้เหมาะสำหรับผู้ที่มีพื้นฐาน JavaScript และต้องการต่อยอดเป็น Full Stack Developer ด้วย Node.js",
    price: 1299,
    point: 100,
    rating: 4.5,
    instructor: {
      name: "อาจารย์ สมชาย ใจดี",
      bio: "Full Stack Developer และอาจารย์สอนพัฒนาเว็บไซต์มากว่า 10 ปี ผู้เชี่ยวชาญด้าน Node.js และ React",
      avatar: TestImage
    },
    student_enrolled: 1245,
    last_updated: "2025-02-15",
    language: "ไทย",
    duration: 42, // hours
    level: "intermediate",
    slug: "nodejs-2025-professional-web-development",
    what_you_will_learn: [
      "พัฒนาเว็บแอปพลิเคชันด้วย Node.js และ Express.js ตั้งแต่เริ่มต้นจนถึงขั้นสูง",
      "เรียนรู้การใช้งาน MongoDB และ Mongoose เพื่อจัดการฐานข้อมูล",
      "สร้าง RESTful API ที่มีประสิทธิภาพและปลอดภัย",
      "การจัดการ Authentication และ Authorization ด้วย JWT",
      "การ Deploy แอปพลิเคชันบน Cloud Platform",
      "การทำ Real-time Application ด้วย Socket.io"
    ],
    requirements: [
      "ความรู้พื้นฐานเกี่ยวกับ HTML, CSS และ JavaScript",
      "ความเข้าใจพื้นฐานเกี่ยวกับการทำงานของเว็บแอปพลิเคชัน",
      "คอมพิวเตอร์ที่สามารถติดตั้ง Node.js ได้ (Windows, Mac หรือ Linux)"
    ],
    sections: [
      {
        title: "บทนำและการติดตั้ง",
        lectures: [
          { title: "แนะนำคอร์สและผู้สอน", duration: "10:15" },
          { title: "การติดตั้ง Node.js และ NPM", duration: "15:30" },
          { title: "การสร้างโปรเจคแรกด้วย Node.js", duration: "20:45" }
        ]
      },
      {
        title: "พื้นฐาน Node.js",
        lectures: [
          { title: "ทำความเข้าใจ Event Loop", duration: "25:10" },
          { title: "การใช้งาน Modules ใน Node.js", duration: "30:20" },
          { title: "การจัดการไฟล์ด้วย File System Module", duration: "28:15" },
          { title: "การสร้าง HTTP Server เบื้องต้น", duration: "35:40" }
        ]
      },
      {
        title: "Express.js Framework",
        lectures: [
          { title: "แนะนำ Express.js และการติดตั้ง", duration: "15:25" },
          { title: "การสร้าง Routes และ Middleware", duration: "40:30" },
          { title: "การจัดการ Templates ด้วย EJS", duration: "35:15" },
          { title: "การจัดการ Forms และ File Upload", duration: "45:20" }
        ]
      },
      {
        title: "การเชื่อมต่อกับฐานข้อมูล",
        lectures: [
          { title: "แนะนำ MongoDB และการติดตั้ง", duration: "20:15" },
          { title: "การใช้งาน Mongoose ODM", duration: "35:30" },
          { title: "การออกแบบ Schema และ Model", duration: "40:25" },
          { title: "การทำ CRUD Operations", duration: "50:10" }
        ]
      }
    ]
  }
];

const CourseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [typeModal, setTypeModal] = useState(0); 

  useEffect(() => {

    setLoading(true);
    setTimeout(() => {
      const foundCourse = mockCourses.find(c => c.slug === slug);
      setCourse(foundCourse || null);
      setLoading(false);
    }, 500);
  }, [slug]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-not-found">
        <h2>ไม่พบคอร์สเรียนที่คุณต้องการ</h2>
        <p>กรุณาตรวจสอบ URL หรือกลับไปที่หน้ารายการคอร์สเรียน</p>
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      <Topbar
        modalStatus={showModal}
        setShowModal={setShowModal}
        setTypeModal={setTypeModal}
      />
      
      <div className="course-header">
        <div className="container">
          <div className="course-header-content">
            <div className="course-info">
              <h1>{course.title}</h1>
              <p className="course-description">{course.description}</p>
              
              <div className="course-meta">
                <div className="course-rating">
                  <span className="rating-value">{course.rating}</span>
                  <Rating value={course.rating} readOnly precision={0.5} size="small" />
                  <span className="student-count">({course.student_enrolled.toLocaleString()} นักเรียน)</span>
                </div>
                
                <div className="course-instructor">
                  <span>สร้างโดย </span>
                  <a href="#instructor">{course.instructor.name}</a>
                </div>
                
                <div className="course-details-meta">
                  <span><FaRegCalendarAlt /> อัพเดทล่าสุด {course.last_updated}</span>
                  <span><FaGlobe /> {course.language}</span>
                  <span>
                    <FaSignal /> 
                    {course.level === "beginner" && "สำหรับผู้เริ่มต้น"}
                    {course.level === "intermediate" && "ระดับกลาง"}
                    {course.level === "expert" && "ระดับสูง"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="course-content container">
        <div className="course-main">
          {/* Tabs Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="course detail tabs">
              <Tab label="ภาพรวม" id="tab-0" />
              <Tab label="เนื้อหาคอร์ส" id="tab-1" />
              <Tab label="ผู้สอน" id="tab-2" />
              <Tab label="รีวิว" id="tab-3" />
            </Tabs>
          </Box>
          
          <div role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0">
            {activeTab === 0 && (
              <div className="course-overview">
                <div className="course-section">
                  <h2>สิ่งที่คุณจะได้เรียนรู้</h2>
                  <div className="learning-points">
                    {course.what_you_will_learn.map((point: string, index: number) => (
                      <div className="learning-point" key={index}>
                        <span className="check-icon">✓</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="course-section">
                  <h2>ข้อกำหนดเบื้องต้น</h2>
                  <ul className="requirements-list">
                    {course.requirements.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="course-section">
                  <h2>รายละเอียดคอร์ส</h2>
                  <div className="course-description-full">
                    {course.longDescription.split('\n\n').map((paragraph: string, index: number) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1">
            {activeTab === 1 && (
              <div className="course-curriculum">
                <h2>เนื้อหาคอร์ส</h2>
                <div className="course-sections">
                  {course.sections.map((section: any, sectionIndex: number) => (
                    <div className="curriculum-section" key={sectionIndex}>
                      <div className="section-header">
                        <h3>{section.title}</h3>
                        <span>{section.lectures.length} บทเรียน</span>
                      </div>
                      <div className="section-lectures">
                        {section.lectures.map((lecture: any, lectureIndex: number) => (
                          <div className="lecture-item" key={lectureIndex}>
                            <div className="lecture-icon">
                              <FaPlay />
                            </div>
                            <div className="lecture-title">
                              {lecture.title}
                            </div>
                            <div className="lecture-duration">
                              {lecture.duration}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div role="tabpanel" hidden={activeTab !== 2} id="tabpanel-2">
            {activeTab === 2 && (
              <div className="course-instructor-tab" id="instructor">
                <h2>ผู้สอน</h2>
                <div className="instructor-profile">
                  <div className="instructor-avatar">
                    <img src={course.instructor.avatar} alt={course.instructor.name} />
                  </div>
                  <div className="instructor-info">
                    <h3>{course.instructor.name}</h3>
                    <p className="instructor-bio">{course.instructor.bio}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div role="tabpanel" hidden={activeTab !== 3} id="tabpanel-3">
            {activeTab === 3 && (
              <div className="course-reviews">
                <h2>รีวิวจากผู้เรียน</h2>
                <div className="reviews-summary">
                  <div className="average-rating">
                    <div className="rating-number">{course.rating}</div>
                    <div className="rating-stars">
                      <Rating value={course.rating} readOnly precision={0.5} size="large" />
                    </div>
                    <div className="rating-count">{course.student_enrolled} รีวิว</div>
                  </div>
                </div>
                <div className="no-reviews-message">
                  <p>ยังไม่มีรีวิวสำหรับคอร์สนี้</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="course-sidebar">
          <div className="course-card">
            <div className="course-thumbnail">
              <img src={course.thumbnail} alt={course.title} />
              <div className="play-overlay">
                <FaPlay />
              </div>
            </div>
            <div className="course-card-content">
              <div className="course-price">
                {course.price > 0 ? (
                  <span className="price">฿{course.price.toLocaleString()}</span>
                ) : (
                  <span className="free">เรียนฟรี</span>
                )}
              </div>
              
              <div className="course-actions">
                <Button variant="contained" color="primary" fullWidth className="enroll-button">
                  ลงทะเบียนเรียน
                </Button>
                <Button variant="outlined" color="primary" fullWidth className="wishlist-button">
                  เพิ่มในรายการโปรด
                </Button>
              </div>
              
              <div className="course-includes">
                <h3>คอร์สนี้ประกอบด้วย:</h3>
                <ul>
                  <li><FaRegClock /> {course.duration} ชั่วโมงของวิดีโอ</li>
                  <li><FaRegFileAlt /> {course.sections.reduce((acc: number, section: any) => acc + section.lectures.length, 0)} บทเรียน</li>
                  <li><FaInfinity /> เข้าถึงตลอดชีพ</li>
                  <li><FaMobileAlt /> เข้าถึงได้ทุกอุปกรณ์</li>
                  <li><FaTrophy /> ใบประกาศนียบัตรเมื่อเรียนจบ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
