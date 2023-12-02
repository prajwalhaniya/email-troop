/* eslint-disable react/prop-types */
import { Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import { postRequest } from "../../api";

function EmailView({ closeView }) {
    const [emails, setEmails] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const getAllUniqueEmails = async (limit = 12) => {
        try {
            const params = {
                /** Pass user id */
                limit: limit
            }
            const result = await postRequest('/get-unique-emails', params);
            setEmails(result.rows);
            setTotal(result.count);
        } catch (error) {
            console.log('Error while getting the emails', error);
        }
    }

    let pages = parseInt(total / 12);
    const remaining = total % 12;
    if (remaining > 0) {
        pages += 1;
    }

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
        getAllUniqueEmails(newPage * 12);
    };

    useEffect(() => {
        getAllUniqueEmails();
    }, []);

    const startIndex = (12*page) > 12 ? (12*page) - 12 : 0;
    const textStyle = { maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' };

    return (
        <>
            <div className="mb-2">
                <span style={{ float: 'right', marginRight: '1rem', cursor: 'pointer'}} onClick={closeView}>close X</span>
            </div>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} arial-label="simple-table">
                    <TableHead>
                        <TableRow>
                            <TableCell className="text-bold">#</TableCell>
                            <TableCell className="text-bold">email</TableCell>
                            <TableCell className="text-bold">Last contacted</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            emails && emails.length > 0 ?
                            emails.map((email, index) => {
                                return (
                                    <>
                                        <TableRow key={email?.id}>
                                            <TableCell className="text-right">{startIndex + index + 1}</TableCell>
                                            <TableCell style={textStyle}>{email?.email}</TableCell>
                                            <TableCell>{email?.email_date}</TableCell>
                                        </TableRow>
                                    </>
                                )
                            })
                            :
                            null
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            <div className="mt-2 mb-2 col-8 text-right p-0">
                <Pagination count={pages} color="primary" page={page} variant="outlined" shape="rounded" onChange={handlePageChange} />
            </div>
        </>
    );
}

export default EmailView;