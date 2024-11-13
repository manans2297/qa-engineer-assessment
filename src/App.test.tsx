import React from 'react';
import {render,fireEvent,screen} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import App from './App'
import {Todo} from './interface'

beforeEach(() => {
    const localStorageMock = (() => {
      let pass: { [key: string]: string } = {};
    
    return {
        getItem(key: string) {
          return pass[key] || null;
        },
        setItem(key: string, value: string) {
            pass[key] = value;
          },
          clear() {
            pass = {};
          },
          removeItem(key: string) {
            delete pass[key];
          },
        }
    })();
    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
    });
    afterEach(() => {
        //Clear cache between tests
        window.localStorage.clear();
    });
      
    //Verify that clicking a todo item changes its unchecked state
    test('Clicking todo item changes its checked state - unchecked->checked', () => {
      render (<App />);
      let checklistItem = screen.getByLabelText(/Buy groceries/i);
    
      //checkbox unchecked
      expect(checklistItem).not.toBeChecked();
    
      //checkbox checked
      fireEvent.click(checklistItem);
      checklistItem = screen.getByLabelText(/Buy groceries/i);
      //Expect it to be checked
      expect(checklistItem).toBeChecked();
    });
    
    //Verify that clicking a todo item should change the checked state.
    test('Toggling todo item changes its checked state - checked->unchecked', () => {
        render(<App />);
        const checklistItem = screen.getByLabelText(/Ace CoderPad interview/i);

        //checkbox unchecked
        expect(checklistItem).toBeChecked();

        //click checkbox
        fireEvent.click(checklistItem);

        //Expect it to be checked
        expect(checklistItem).not.toBeChecked();
    });


    //State Persistence: todo list is correctly saved to local storage.
    test('Load the todos to localStorage', () => {
        const todos = [
        { id: '1', label: 'Test 1', checked: false },
        { id: '2', label: 'Test 2', checked: true },
        { id: '3', label: 'Test 3', checked: true },
        ];

        //Set localStorage
        window.localStorage.setItem('todos', JSON.stringify(todos));

        const { getByText } = render(<App />);

        //Check if todos are loaded from localStorage
        const todoItem = getByText(/Test 3/i);
        expect(todoItem).toBeInTheDocument();
    });

    //todo list state is saved to local storage when modified
    test('Save todos to localStorage whenever a new todo is added', async () => {
        window.localStorage.clear();
        render(<App />);
      
        const input_item = screen.getByPlaceholderText('Add a new todo item here');
        fireEvent.change(input_item, {target: {value: 'New Todo Item' }});
        fireEvent.submit(input_item.closest('form')!);
      
        const newItem = await screen.findByText(/New Todo Item/i);
        expect(newItem).toBeInTheDocument();
      
        const savedList = JSON.parse(window.localStorage.getItem('todos') || '[]');
        const addedTodo = savedList.find((todo: Todo) => todo.label === 'New Todo Item');
      
        expect(addedTodo).toBeDefined();
        expect(addedTodo.checked).toBe(false);
    });

    //checked items automatically move to the bottom of the list.
    test('Checked items automatically move to the bottom of the list', () => {

        const todos = [
            { id: '1', label: 'Test 1', checked: false },
            { id: '2', label: 'Test 2', checked: false },
            { id: '3', label: 'Test 3', checked: false },
          ];
          
        window.localStorage.setItem('todos', JSON.stringify(todos));
        render(<App />);
      
        //Get list of items before any interaction
        let list_Items = screen.getAllByRole('listitem');
      
        // Verify initial order of item list
        expect(list_Items[0]).toHaveTextContent('Test 1');
        expect(list_Items[1]).toHaveTextContent('Test 2');
        expect(list_Items[2]).toHaveTextContent('Test 3');
        
        //checking the new item ("New Item")
        const item1Checkbox = screen.getByLabelText('Test 1');
        fireEvent.click(item1Checkbox);
        list_Items = screen.getAllByRole('listitem');

        //Verify the count
        expect(list_Items).toHaveLength(3);

        //Verify "New Item" has moved to the bottom
        expect(list_Items[0]).toHaveTextContent('Test 2');
        expect(list_Items[1]).toHaveTextContent('Test 3');
        expect(list_Items[2]).toHaveTextContent('Test 1');
    });