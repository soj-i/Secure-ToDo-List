"use client";

import {
  Accordion,
  AccordionItem,
  AccordionItemButton,
  AccordionItemHeading,
  AccordionItemPanel,
} from "react-accessible-accordion";
import "react-accessible-accordion/dist/fancy-example.css";
import { FiLogOut } from 'react-icons/fi';

import styles from "./page.module.css";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { StrikeThroughMaybe } from "@/lib/components/StrikeThroughMaybe";

export default function Home() {
  //React hooks
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState({});

  const router = useRouter();
  const listRef = useRef(null);
  const searchRef = useRef(null);

  // Get all the lists for the user ID from the DB
  const getLists = async () => {
    const requestOptions = {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': window.localStorage.getItem("jwt") 
      }
    };

    const listsFromApi = await fetch(`/api/list`, requestOptions)
      .then((res) => {
        if (!res.ok) logOut();
        else return res.json();
      });

    // Place listsFromApi into the "lists" variable (line 20)
    setLists(listsFromApi);
  };

  // Add a new list into the list with ID <listID>; details in "event"
  const createList = async (event) => {
    event.preventDefault();
    const body = { 
      listname: event.target[0].value
    };
    const requestOptions = {
      method: "POST",
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': window.localStorage.getItem("jwt") 
      },
      body: JSON.stringify(body)
    };

    fetch("/api/list", requestOptions)
      .then(async (res) => {
        if (!res.ok) logOut();
        else {
          getLists();
          clearRefs();
        }
      })
  }

  // Get all the tasks for a given list ID from the DB
  const getTasks = async (listId) => {
    const requestOptions = {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': window.localStorage.getItem("jwt") 
      }
    };

    const tasksFromApi = await fetch(`/api/task?list_id=${listId}`, requestOptions)
      .then((res) => {
        if (!res.ok) logOut();
        else return res.json()
      });

    // Place "tasksFromApi" into the "tasks" map against the
    // list ID (line 21)
    setTasks((previousTasks) => {
      return { ...previousTasks, [listId]: tasksFromApi };
    });
    clearRefs();
  };

  // Add a new task into the list with ID <listId>; details in "event"
  const createTask = (listID) => async (event) => {
    event.preventDefault();
    const body = { 
      taskname: event.target[0].value, 
      priority: event.target[1].value, 
      deadline: event.target[2].value,
      list_id: listID 
    };
    const requestOptions = {
      method: "POST",
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': window.localStorage.getItem("jwt") 
      },
      body: JSON.stringify(body)
    };

    fetch("/api/task", requestOptions)
      .then((res) => {
        if (!res.ok) logOut();
        else {
          getTasks(listID);
          clearRefs();
        }
      });
  };

  // Change whether a task has been completed or not
  // based on whether the box is checked
  const toggleTask = async (event, listID, taskID) => {
    const requestOptions = {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': window.localStorage.getItem("jwt") 
      }
    };

    fetch(`/api/task?task_id=${taskID}&completed=${event.target.checked}`, requestOptions)
      .then((res) => {
        if (!res.ok) logOut();
        else {
          getTasks(listID);
        }
      });
  }

  // Process the user's search query and redirect to the /search page
  // passing in the query as a URL parameter
  const redirectToSearch = async (event) => {
    event.preventDefault();
    const searchQuery = event.target[0].value;
    router.push(`/search?search_query=${searchQuery}`);
  }

  // Clear input boxes and other selections after submission
  const clearRefs = () => {
    listRef.current.value = "";
    searchRef.current.value = "";
  }

  const logOut = () => {
    window.localStorage.removeItem("jwt");
    router.replace("/login");
  }

  // This hook executes when the page is loaded. When the page loads,
  // it needs to know the lists for the user to display them on the page.
  // Everything populated as a result of this function can be used
  // while rendering the DOM as below.
  useEffect(() => {
    if (!window.localStorage.getItem("jwt")) router.replace("/login");
    else getLists();
  }, []);

  // The following function returns the HTML that will 
  // be rendered before being displayed in the browser.

  // Accordian is UI (User Interface) element that allows 
  // collapsing and displaying of list items.

  // Comments below are enclosed within "{/* */}" blocks
  return (
    <main>
      <div className={styles["search-header-item"]}><button onClick={logOut}><FiLogOut size={25}/></button></div>
      
      {/* Display the search box. When the user clicks 
          search, redirectToSearch() gets invoked */}
      <div className={styles["input-block"]}>
        <form className={styles["input-section"]} onSubmit={redirectToSearch}>
          <input type="text" ref={searchRef} placeholder="Search for a task..." />
          <input type="submit" value="Search" className={styles["input-block-submit"]} />
        </form>
      </div>

      {/* Display all the lists collapsed to start with.
          If the list is expanded, get the tasks for the list ID */}
      <Accordion onChange={([listId]) => getTasks(listId)} >
        {lists.map(({ list_id, listname }) => {
          return <AccordionItem uuid={list_id} key={list_id}>
            <AccordionItemHeading>
              <AccordionItemButton>
                {listname}
              </AccordionItemButton>
            </AccordionItemHeading>

            {/* For each expanded list, display an unordered list (UL)
                containing the tasks against the list ID */}
            <AccordionItemPanel>
              <ul className={styles["todo-list"]}>

                {/* The tasks inside the UL need to be populated based on the 
                    what's in "tasks[listID]". For each task, we look at its 
                    5 fields from the DB below */}
                {tasks[list_id]?.map(({ task_id, taskname, completed, priority, deadline }) => {
                  return <li className={styles["li"]} key={task_id}>

                    {/* If task_id's task has been marked completed, strikethrough the task details */}
                    <StrikeThroughMaybe add={completed}>
                      <table><tbody>
                        <td>

                          {/* If task_id's task has been marked completed, keep the box checked */}
                          <input className={styles["form-check-input"]} type="checkbox" onChange={e => toggleTask(e, list_id, task_id)} checked={completed} />
                        </td>
                        <td>

                          {/* The dangerouslySetInnerHTML attribute inside <span> tags
                              ensure that any valid HTML in its value is rendered.
                              (Equivalent to setting "spanElement.innerHTML = <something>;" in JavaScript) */}
                          <tr>
                            <th>Deadline:</th>
                            <td><span dangerouslySetInnerHTML={{ __html: deadline }}></span></td>
                          </tr>
                          <tr>
                            <th>Priority:</th>
                            <td><span dangerouslySetInnerHTML={{ __html: priority }}></span></td>
                          </tr>
                          <tr>
                            <th>TODO:</th>
                            <td><span className="todo-text" dangerouslySetInnerHTML={{ __html: taskname }}></span></td>
                          </tr>
                        </td>
                      </tbody></table>
                    </StrikeThroughMaybe>
                  </li>
                })}
              </ul>
              
              {/* For the current list, display the place to add a new task
                  3 fields are required: task details, a note on priority, and a deadline */}
              <form className={styles["input-section"]} onSubmit={createTask(list_id)}>
                <input type="text" placeholder="New task details here..." required />
                <input type="text" placeholder="Task priority here..." required />
                <input type="text" placeholder="Deadline here..." required />
                <input type="submit" value="Add task" className={styles["input-block-submit"]}/>
              </form>

            </AccordionItemPanel>
          </AccordionItem>
        })}
      </Accordion>

      {/* Display the place to add a new list */}
      <div className={styles["input-block"]}>
        <form className={styles["input-section"]} onSubmit={createList}>
          <input type="text" ref={listRef} placeholder="New list..." required />
          <input type="submit" value="Create new list" className={styles["input-block-submit"]} />
        </form>
      </div>
    </main>
  )
}