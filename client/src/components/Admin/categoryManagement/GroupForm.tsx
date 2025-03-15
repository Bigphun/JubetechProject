import Toast from 'react-bootstrap/Toast';
import { useState, useEffect } from "react";
import Skeleton from '@mui/material/Skeleton';
import { useGroup, Group } from "../../../contexts/GroupContext";
import ToastContainer from 'react-bootstrap/ToastContainer';
import { BsSearch, BsPlusLg, BsPencilSquare, BsFillTrashFill, BsX, BsFillTrash3Fill, BsCheck } from "react-icons/bs";

import "../../../assets/css/category/group-list.css";

interface GroupState {
    name: string
}

interface ResponseMessage {
    status: number,
    message: string
}

const isUnknown = (status:number) => status < 200;
const isSuccess = (status:number) => status >= 200 && status < 300;
const isClientError = (status:number) => status >= 400 && status < 500;
const isServerError = (status:number) => status >= 500 && status < 600;

const alertStyle = {
    width: "15px",
    height: "15px",
    marginRight: "10px",
    borderRadius: "5px",
}

interface GroupFormProp {
    startGroup: boolean,
    setStartGroup: (value:boolean | ((prev:boolean) => boolean)) => void
}

export default function GroupForm({ startGroup, setStartGroup }:GroupFormProp) {
    const { state, fetchAllGroups, createGroups, updateGroup, deleteGroups, dispatch } = useGroup();
    const [filterGroup, setFilterGroup] = useState<Group[]>(state.groups);
    const [messageList, setMessageList] = useState<ResponseMessage[]>([]);
    const [useCreate, setUseCreate] = useState<boolean>(false);
    const [searchGroup, setSearchGroup] = useState<string>("");
    const [deleteId, setDeleteId] = useState<string>("");
    const [groups, setGroups] = useState<GroupState[]>([
        { name: "" }
    ]);
    const [editGroup, setEditGroup] = useState<{ group_id:string, name:string }>({ group_id: "",name: "" });
    const { group_id, name } = editGroup;

    const addGroup = () => {
        setGroups([...groups, { name: "" }]);
    }

    const removeGroup = (removeIndex: number) => {
        if (groups.length > 1) setGroups(groups.filter((_, index) => index !== removeIndex));
    }

    const handleCreateGroup = (currentIndex: number, value: string) => {
        const newGroups = [...groups];
        newGroups[currentIndex].name = value;
        setGroups(newGroups);
    }

    const handleEditGroup = (key:string, value:string) => {
        setEditGroup(prevState => ({ ...prevState, [key]: value}));
    }

    const removeToast = (removeIndex:number) => {
        setMessageList(messageList.filter((_, index) => index !== removeIndex));
    }

    const saveGroup = async(event: React.FormEvent) => {
        event.preventDefault();
        if (groups.length > 0) {
            await createGroups(groups);
            await new Promise(resolve => setTimeout(resolve, 100));
            setGroups([{ name: "" }]);
        } else {
            const response:ResponseMessage = {
                status: 0,
                message: "The group was not found."
            }
            setMessageList([...messageList, response]);
        }
    }

    const modifyGroup = async(event: React.FormEvent) => {
        event.preventDefault();
        if (group_id && name) {
            await updateGroup(group_id, name);
            handleEditGroup("group_id", "");
            handleEditGroup("name", "");
        }
    }

    const removeGroupById = async() => {
        if (deleteId) {
            await deleteGroups([deleteId]);
        }
    }

    useEffect(() => {
        if (state.groups.length === 0 && startGroup === false) {
            fetchAllGroups("");
            setFilterGroup(state.groups);
            setStartGroup(true);
        } else {
            if (searchGroup.trim() !== "") {
                setFilterGroup(
                    state.groups.filter(group =>
                        group.name.toLowerCase().includes(searchGroup.toLowerCase())
                    )
                );
            } else {
                setFilterGroup(state.groups);
            }
        }

        if (state.response) {
            if (Array.isArray(state.response)) {
                //
            } else {
                const response:ResponseMessage = {
                    status: state.status,
                    message: state.response
                }
                setMessageList([...messageList, response]);
            }
            state.response = "";
            setTimeout(() => {
                setMessageList((prev) => prev.slice(1));
            }, 2000);
        }
        dispatch({ type: "CLEAR_RESPONSE", payload: null, message: "", status: 0 });
    }, [state.response, searchGroup, state.groups]);

    return (
        <div className="group-form">
            {messageList.length > 0 &&
                <ToastContainer position="top-end" className="p-3" style={{ zIndex: 99 }}>
                {messageList.map((alert, index) => (
                    <Toast onClose={() => removeToast(index)} key={index}>
                        <Toast.Header>
                            {isUnknown(alert.status) &&
                                <div style={{ ...alertStyle, backgroundColor: "gray" }}></div>
                            }
                            {isSuccess(alert.status) &&
                                <div style={{ ...alertStyle, backgroundColor: "green" }}></div>
                            }
                            {isClientError(alert.status) &&
                                <div style={{ ...alertStyle, backgroundColor: "red" }}></div>
                            }
                            {isServerError(alert.status) &&
                                <div style={{ ...alertStyle, backgroundColor: "red" }}></div>
                            }
                            <p className='me-auto'>Group alert</p>
                        </Toast.Header>
                        <Toast.Body>
                            <p style={{ fontSize: "0.75rem" }}>{alert.message}</p>
                        </Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
            }
            <p className="group-title">Group List</p>
            <div className="group-options">
                <div className="search-group">
                    <i><BsSearch size={14} /></i>
                    <input
                        type="text"
                        value={searchGroup}
                        onChange={(event) => setSearchGroup(event.target.value)}
                        placeholder="search group by name..."
                    />
                </div>
                <button className="create-group" onClick={() => setUseCreate(true)}>
                    <i><BsPlusLg size={14} /></i>
                </button>
            </div>
            {useCreate &&
                <div className="create-group-container">
                    <div className="create-group-option">
                        <button onClick={() => setUseCreate(false)}>
                            <i><BsX size={20} /></i>
                        </button>
                    </div>
                    <form className="main-create-section" onSubmit={saveGroup}>
                        {groups.map((group, index) => (
                            <div className="create-group-card" key={index}>
                                <input
                                    type="text"
                                    value={group.name}
                                    onChange={(event) => handleCreateGroup(index, event.target.value)}
                                    placeholder="input your group name..."
                                    required
                                />
                                <button type="button" className="remove-group" onClick={() => removeGroup(index)}>
                                    <i><BsFillTrash3Fill size={13} /></i>
                                </button>
                            </div>
                        ))}
                        <button type="submit" className="submit-group">
                            create
                        </button>
                        <button type="button" className="add-group" onClick={() => addGroup()}>
                            <i><BsPlusLg /></i>
                            Add group
                        </button>
                    </form>
                </div>
            }
            {state.loading
                ?
                <div className="skeleton-container">
                    <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} />
                    <Skeleton variant="rectangular" width={210} height={60} />
                    <Skeleton variant="rounded" width={210} height={10} />
                    <br /><br />
                    <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} />
                    <Skeleton variant="rectangular" width={210} height={60} />
                    <Skeleton variant="rounded" width={210} height={10} />
                </div>
                :
                <div className="group-list-container">
                    {filterGroup.map((group, index) => (
                        <div className="group-card" key={index}>
                            {group_id === group._id
                                ?
                                <>
                                    <div className="sub-option">
                                        <button>
                                            <i><BsPencilSquare /></i>
                                        </button>
                                        <button>
                                            <i><BsFillTrashFill /></i>
                                        </button>
                                    </div>
                                    <div className="group-content">
                                        <div className="input-group-modify">
                                            <form onSubmit={modifyGroup}>
                                                <input
                                                    type="text"
                                                    placeholder="input your group name..."
                                                    value={name}
                                                    onChange={(event) => handleEditGroup("name", event.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="cancel-modify"
                                                    onClick={() => {
                                                        handleEditGroup("group_id", "");
                                                        handleEditGroup("name", "");
                                                    }}
                                                >
                                                    <i><BsX size={16} /></i>
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="accept-modify"
                                                >
                                                    <i><BsCheck size={16} /></i>
                                                </button>
                                            </form>
                                        </div>
                                        <span className="group-updated">
                                            Updated At : {new Date(group.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </>
                                :
                                <div className="group-card-list">
                                    <div className="sub-option">
                                        <button onClick={() => {
                                            handleEditGroup("group_id", group._id);
                                            handleEditGroup("name", group.name);
                                        }}>
                                            <i><BsPencilSquare /></i>
                                        </button>
                                        <button onClick={() => setDeleteId(group._id)}>
                                            <i><BsFillTrashFill /></i>
                                        </button>
                                    </div>
                                    {deleteId === group._id &&
                                        <div className="confirm-group-delete">
                                            <button
                                                className="confirm-delete-btn"
                                                onClick={removeGroupById}
                                            >
                                                Confirm delete
                                            </button>
                                            <button
                                                className="cancel-delete-btn"
                                                onClick={() => setDeleteId("")}
                                            >
                                                cancel
                                            </button>
                                        </div>
                                    }
                                    <div className="group-content">
                                        <p className="group-name">
                                            {group.name.length > 18 ? group.name.slice(0, 18) + ".." : group.name}
                                        </p>
                                        <span className="group-updated">
                                            Updated At : {new Date(group.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            }
                        </div>
                    ))}
                </div>
            }
        </div>
    );
}