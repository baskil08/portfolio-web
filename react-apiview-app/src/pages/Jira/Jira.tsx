import React, {useEffect, useState} from "react";
import axios from "axios";
import {PopUp} from "../../components/PopUp/PopUp";
import {JiraTicket} from "../../data/dataJira";


const initialValues = {
    prompt: ""
};

const initialTicketValues = {
    key: "",
    summary: "",
    description: "",
};

const initialGetTicketValues = {
    key: "",
    fields: {
        summary: "",
        description: ""
    }
};

export const jiraKey = (process.env.REACT_APP_JIRA_KEY || 'test')
export const jiraProxy = "http://localhost:8500/webDomain";
export const jiraDomain = (process.env.REACT_APP_JIRA_DOMAIN || 'test')

export default function Jira(this: any) {

    const [loading, setLoading] = useState(false)
    const [values, setValues] = useState(initialTicketValues);
    const [tickets, setTickets] = useState([initialGetTicketValues])
    const [selectedTicket, setSelectedTicket] = useState(initialGetTicketValues)
    const [isOpen, setIsOpen] = useState(false)
    const [isTicketOpen, setTicketIsOpen] = useState(false)

    // Load all get methods once, when page renders
    useEffect(() => {
        getTickets()
    }, []);


    const handleChange = (event: { target: { name: any; value: any; }; }) => {
        console.log(values);
        const {name, value} = event.target;
        setValues({
            ...values,
            [name]: value,
        });
        getTickets()
    };


    const handleGetSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        getTickets()
    };

    function getTickets() {
        const postData = {
            webDomain: jiraDomain + "/rest/api/latest/search?jql=project=PW&maxResults=1000&fields=key,summary,description",
            webApiKey: "Basic " + jiraKey
        };

        let axiosConfig = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        //console.log("postData: ", postData);
        axios.post(jiraProxy + "/get", postData, axiosConfig)
            .then((response) => {
                //console.log("RESPONSE RECEIVED: ", response.data.issues);
                setTickets(response.data.issues)

            })
            .catch((error) => {
                //console.log("AXIOS ERROR: ", postData);
            })
    }

    function updateTicket(ticket: any, reference: any) {
        console.log("reference: ", reference);
        console.log("ticket: ", ticket);
        let postData = {
            update: {
                summary: [
                    {
                        set: (ticket.summary || reference.fields.summary)
                    }
                ],
                description: [
                    {
                        set: (ticket.description || reference.fields.description)
                    }
                ]
            },
            webDomain: jiraDomain + "/rest/api/latest/issue/" + reference.key,
            webApiKey: "Basic " + jiraKey
        };


        let axiosConfig = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        //console.log("postData: ", postData);
        axios.put(jiraProxy + "/put", postData, axiosConfig)
            .then((response) => {
                getTickets()

            })
            .catch((error) => {
                getTickets()
            })
        getTickets()
    }

    function initiateUpdateTicket(ticket: JiraTicket) {
        setSelectedTicket(ticket)
        setTicketIsOpen(!isTicketOpen)
        console.log("ticket: ", ticket);
    }

    function deleteTicket(ticketKey: string) {
        const postData = {
            webDomain: jiraDomain + "/rest/api/latest/issue/" + ticketKey,
            webApiKey: "Basic " + jiraKey
        };

        let axiosConfig = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        //console.log("postData: ", postData);
        axios.post(jiraProxy + "/delete", postData, axiosConfig)
            .then((response) => {
                //console.log("RESPONSE RECEIVED: ", response.data.issues);
                getTickets()

            })
            .catch((error) => {
                //console.log("AXIOS ERROR: ", postData);
            })
    }

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        newTicket(values)
    };

    function newTicket(input: any) {
        const postData = {
            fields: {
                project:
                    {
                        key: "PW"
                    },
                summary: input.summary,
                description: input.description,
                issuetype: {
                    name: "Task"
                },
            },
            webDomain: "https://web-portfolio.atlassian.net/rest/api/latest/issue",
            webApiKey: "Basic " + jiraKey
        };

        let axiosConfig = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        console.log("postData: ", postData);
        axios.post(jiraProxy + "/post", postData, axiosConfig)
            .then((response) => {
                getTickets()
                //console.log("RESPONSE RECEIVED: ", response);
            })
            .catch((error) => {
                //console.log("AXIOS ERROR: ", error.response);
            })
    }


    return (
        <section>
            <article>
                {isTicketOpen ?
                    <PopUp
                        jiraTicket={selectedTicket}
                        closePopup={() => setTicketIsOpen(false)}
                        submit={updateTicket}
                    />
                    : null}
                <div className="login-top">
                    <h1>{("Create a Jira ticket")}</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <label>
                        Ticket info:
                        <p/>
                        <input
                            type="text"
                            name="summary"
                            placeholder="Enter ticket title"
                            onChange={handleChange}
                            value={values.summary}
                            maxLength={50}
                            required
                            size={100}
                        />
                        <input
                            type="text"
                            name="description"
                            placeholder="Enter ticket description"
                            onChange={handleChange}
                            value={values.description}
                            maxLength={50}
                            required
                            size={100}
                        />
                    </label>
                    <input className="login-submit" id="loginButton" type="submit" value="Submit"/>
                </form>
                <div>
                    <div className="login-top">
                        <h1>{("All Jira tickets")}
                            <form onSubmit={handleGetSubmit}>
                                <input className="login-submit" id="loginButton" type="submit" value="Get tickets"/>
                            </form>
                        </h1>
                    </div>

                    <div className="Item">
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                            <>
                                <table>
                                    <tr>
                                        <th>Key</th>
                                        <th>Summary</th>
                                        <th>Description</th>
                                    </tr>
                                    {tickets.map(ticket => (
                                        <tr key={ticket.key}>
                                            <td>{ticket.key}</td>
                                            <td>{ticket.fields.summary}</td>
                                            <td>{ticket.fields.description}</td>
                                            <button className="update-button"
                                                    style={{background: 'green', color: 'white'}}
                                                    onClick={() => initiateUpdateTicket(ticket)}
                                            > Update
                                            </button>
                                            <button className="delete-button"
                                                    style={{background: 'red', color: 'white'}}
                                                    onClick={() => deleteTicket(ticket.key)}
                                            > Delete
                                            </button>
                                        </tr>
                                    ))}
                                </table>
                            </>
                        )}
                    </div>
                </div>
            </article>
        </section>


    )
}

